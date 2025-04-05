import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  course: { type: mongoose.Types.ObjectId, ref: "courses", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  contents: {
    video: {
      title: { type: String },
      url: { type: String },
      youtube_video_url:{ type: String },
      publicId: String,
    },
    resource: {
      title: { type: String},
      url: { type: String },
    },
    quiz: { type: mongoose.Types.ObjectId, ref: "quizzes" },
    assignment: { type: mongoose.Types.ObjectId, ref: "assignments" },
  }
});

export const ModuleModel = mongoose.model("modules", ModuleSchema);
