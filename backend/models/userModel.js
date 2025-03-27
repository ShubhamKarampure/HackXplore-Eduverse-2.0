import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  image: {
    url: String,
    publicId: String,
  },
  dob: {
    type: {
      day: Number,
      month: Number,
      year: Number,
    },
  },
  interests: {
    type: [String],
    default: [],
  },
  about: {
    type: String,
    default: "",
  },
  personalizedRoadmap: {
    type: Map,
    of: new mongoose.Schema(
      {
        performance: {
          type: Number,
          default: 0,
        },
        suggestions: {
          type: Map,
          of: [String],
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
      { _id: false }
    ),
    default: new Map(),
  },
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId && !this.githubId;
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ["Student", "Teacher"],
  },
  enrolledCourses: {
    type: [mongoose.Types.ObjectId],
    ref: "courses",
    default: [],
  },
  profile: UserProfileSchema, // Embedded Profile Schema
});

export const UserModel = mongoose.model("users", UserSchema);
