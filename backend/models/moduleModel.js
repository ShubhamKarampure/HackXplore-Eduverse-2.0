import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  course: { type: mongoose.Types.ObjectId, ref: "courses", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  contents: [
    {
      type: { type: String, required: true }, // video, text, assignment, quiz
      title: { type: String, required: true },
      description: String,
      resource: {
        url: String,
        duration: Number,
        publicId: String,
      },
    },
  ],
  quiz: { type: mongoose.Types.ObjectId, ref: "quizzes" },
  assignments: [{ type: mongoose.Types.ObjectId, ref: "assignments" }],
});

export const ModuleModel = mongoose.model("modules", ModuleSchema);
