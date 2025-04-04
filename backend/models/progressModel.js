import mongoose from "mongoose";

const ProgressSchema = mongoose.Schema({
  student: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
  course: {
    type: mongoose.Types.ObjectId,
    ref: "courses",
    required: true,
  },
  // Store quiz attempts with scores
  quizAttempts: [
    {
      quizId: {
        type: mongoose.Types.ObjectId,
        ref: "quizzes",
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      passed: {
        type: Boolean,
        default: false,
        
      },
      cheated: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Suggested YouTube links based on quiz performance
  suggestedVideos: [
    {
      title: String,
      url: String,
      reason: String, // Why this video is suggested
    },
  ],

  suggestions: {
    type: String,
    default: "none",
  }

});

export const ProgressModel = mongoose.model("progress", ProgressSchema);