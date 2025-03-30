import { UserModel } from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export const authController = {
  async signup(req, res) {
    try {
      const { email, firstName, lastName, password } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new UserModel({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        profile: {} // Initialize empty profile
      });

      await newUser.save();

      // Generate JWT
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
        onboardingRequired: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during signup' });
    }
  }, async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check if profile is complete
      const profile = user.profile || {};
      const isProfileComplete =
        profile.dob?.day &&
        profile.dob?.month &&
        profile.dob?.year &&
        Array.isArray(profile.interests) &&
        profile.interests.length > 0 &&
        profile.about &&
        profile.about.trim().length > 0;

      const onboardingRequired = !isProfileComplete;

      // Generate JWT
      const token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
           profile: user.profile,
          role : user.role,
        },
        onboardingRequired,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error during login" });
    }
  },
  
  async googleAuth(req, res) {
    try {
      const token = req.body.token;
    
      if (!token) {
        return res.redirect('/login?error=no_token');
      }

      const client = new OAuth2Client(GOOGLE_CLIENT_ID);

      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
    
      const payload = ticket.getPayload();
      if (!payload) {
        return res.redirect('/login?error=invalid_token');
      }
  
      const { email, given_name, family_name, sub: googleId, picture } = payload;

      // Find or create user
      let user = await UserModel.findOne({
        $or: [{ googleId }, { email }]
      });

      if (!user) {
        user = new UserModel({
          email,
          firstName: given_name,
          lastName: family_name,
          googleId,
          profile: {} // Empty profile
        });
        await user.save();
      }

      // Check if profile is complete
      const profile = user.profile || {};
      const isProfileComplete =
        profile.dob?.day &&
        profile.dob?.month &&
        profile.dob?.year &&
        Array.isArray(profile.interests) &&
        profile.interests.length > 0 &&
        profile.about &&
        profile.about.trim().length > 0;

      const onboardingRequired = !isProfileComplete;

      // Generate JWT
      const jwtToken = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profile: user.profile,
          role: user.role,
          image: picture, // Return user image from Google
        },
        onboardingRequired,
      });
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during Google login' });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId  = req.userId;
      
      const {
        role,
        dob,
        interests,
        about
      } = req.body;

      // Find the user and update profile details
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            role,
            'profile.dob': dob,
            'profile.interests': interests,
            'profile.about': about
          }
        },
        {
          new: true,  // Return the updated document
          runValidators: true  // Run model validations
        }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        role: updatedUser.role,
        profile: updatedUser.profile
      });

    } catch (error) {
      console.error('Error updating user profile details:', error);
    
      if (error) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }

      res.status(500).json({
        message: 'Internal server error while updating user profile details'
      });
    }
  }
};