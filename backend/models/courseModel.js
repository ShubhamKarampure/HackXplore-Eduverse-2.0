import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  instructor: { type: mongoose.Types.ObjectId, ref: "users", required: true },
  description: { type: String, required: true },
  enrollKey: { type: String, required: true },
  image: {
    url: { type: String },
    publicId: { type: String },
  },
  students: [{ type: mongoose.Types.ObjectId, ref: "users" }],
  modules: [{ type: mongoose.Types.ObjectId, ref: "modules" }],
  syllabus: {
    url: { type: String }, // S3, Cloudinary, or local file path
    publicId: { type: String }, // Optional for cloud storage
  },
  semester: { type: Number, required: true },
  textbooks: [
    {
      title: { type: String },
      author: { type: String },
      url: { type: String }, // S3, Cloudinary, or local file path
      publicId: { type: String }, // Optional for cloud storage
    },
  ],
});

export const CourseModel = mongoose.model("courses", CourseSchema);
