import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  contents: [
    {
      type: { type: String, required: true },
      title: { type: String, required: true },
      description: String,
      resource: {
        url: String,
        duration: Number,
        publicId: String,
      },
      tags: { type: [String], default: [] },
    },
  ],
  quiz: {
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
        difficulty: { type: Number, default: 1 }, // 1-5 scale
      },
    ],
    passingScore: { type: Number, default: 70 }, // percentage
  },
});

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  instructor: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
  description: { type: String, required: true },
  enrollKey : { type: String, required: true },
  image: {
    url: { type: String },
    publicId: { type: String },
  },
  students: { type: [mongoose.Types.ObjectId], default: [] },
  assignments: { type: [mongoose.Types.ObjectId], default: [] },
  modules: { type: [ModuleSchema], default: [] },

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
