import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Types.ObjectId,
      ref: "users", 
      required: true,
    },
    course_id: {
      type: mongoose.Types.ObjectId,
      ref: "courses", 
      required: true,
    },
    material_material: [{
      topic: {
        type: String, 
        required: true,
      },
      url: {
        type: String,
        required: true,
      }
    }],
    format: {
      type: String,
      enum: ["pdf", "ppt", "html"], 
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StudyMaterialModel = mongoose.model("materials", studyMaterialSchema);

export default StudyMaterialModel;