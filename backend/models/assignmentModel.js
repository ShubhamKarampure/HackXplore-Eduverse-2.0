import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
  module: { type: mongoose.Types.ObjectId, ref: "modules", required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  criteria: { type: [String], required: true },
  submissions: [
    {
      student: { type: mongoose.Types.ObjectId, ref: "users" },
      submission: String,
      public_id: String,
      submissionDate: Date,
      late: Boolean,
      grade: Number,
    },
  ],
});

export const AssignmentModel = mongoose.model("assignments", AssignmentSchema);
