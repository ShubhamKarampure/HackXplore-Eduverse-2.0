import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
  module: { type: mongoose.Types.ObjectId, ref: "modules" },
  title: { type: String },
  description: { type: String },
  deadline: { type: Date },
  criteria: [{ 
    name: { type: String },
    maxScore: { type: Number, default: 10 }
  }],
  totalPoints: { type: Number, default: 100 },
  submissions: [
    {
      student: { type: mongoose.Types.ObjectId, ref: "users" },
      submission: String, // URL to the PDF
      public_id: String,
      submissionDate: Date,
      late: Boolean,
      grade: Number,
      criteriaScores: [{
        criterion: { type: String },
        score: { type: Number },
        max_score: { type: Number }
      }],
      feedback: { type: String }
    },
  ],
});

export const AssignmentModel = mongoose.model("assignments", AssignmentSchema);