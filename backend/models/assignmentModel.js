import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
  module: { type: mongoose.Types.ObjectId, ref: "modules" },
  title: { type: String},
  description: { type: String},
  deadline: { type: Date },
  criteria: { type: [String]},
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
