import express from 'express';
import { authController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/auth/google', authController.googleAuth);

// Protected Route - Update Profile
router.put('/create-profile', authMiddleware, authController.updateProfile);

export const userRouter = router;