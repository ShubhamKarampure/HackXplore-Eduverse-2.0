import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
  module: { type: mongoose.Types.ObjectId, ref: "modules", required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: {
        a: { type: String, required: true },
        b: { type: String, required: true },
        c: { type: String },
        d: { type: String },
      },
      answer: { type: String, required: true },
      conceptTags: { type: [String], default: [] },
      difficulty: { type: Number, default: 1 },
    },
  ],
  passingScore: { type: Number, default: 70 },
});

export const QuizModel = mongoose.model("quizzes", QuizSchema);
