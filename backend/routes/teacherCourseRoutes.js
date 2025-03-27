import express from "express";
import {
  createCourse,
  getQuizController,
  generateQuizController,
  getAllCourses,
  createRoadmapController,
  uploadContentController,
} from "../controllers/courseControllers.js";
import fileUpload from "express-fileupload";

const router = express.Router();

router.route("/").post(createCourse).get(getAllCourses);
router
  .route("/get-course/:id/:idx")
  .get(getQuizController)
  .post(generateQuizController);
router.route("/roadmap/:id").get(createRoadmapController);
router.route("/roadmap/:id/content").post(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "C:/Windows/Temp",
  }),
  uploadContentController
);

export const teacherCourseRouter = router;
