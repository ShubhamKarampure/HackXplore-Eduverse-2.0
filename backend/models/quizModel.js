import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Types.ObjectId, ref: "modules"},
    questions: [
      {
        question: { type: String},
        options: {
          a: { type: String },
          b: { type: String },
          c: { type: String },
          d: { type: String },
        },
        answer: { 
          type: [String], 
        }, 
        difficulty: { type: Number, enum: [1, 2, 3], default: 1 }, // 1 = Easy, 2 = Medium, 3 = Hard
      },
    ],
    duration: { type: Number}, // Duration in minutes
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export const QuizModel = mongoose.model("quizzes", QuizSchema);
