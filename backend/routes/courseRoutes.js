import express from "express";
import {
  createCourse,
  getAllCourses,
  enrollCourse,
  getMyCourses,
  getCourseDetails
} from "../controllers/courseControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { generateAndSavePPT, getMaterialsByCourseTutor } from "../controllers/materialController.js";
const router = express.Router();

// Public - Get all available courses
router.get("/",authMiddleware , getAllCourses); // Matches /api/v1/user/student/course/
router.get("/my-courses", authMiddleware, getMyCourses); // Get all enrolled courses for the logged-in student
router.get("/:courseId",authMiddleware, getCourseDetails); // Get course details

// Student Actions
router.post("/student/enroll",authMiddleware , enrollCourse); // Enroll in a course

// Teacher Action
router.post("/", authMiddleware, createCourse);
router.post("/material/generate",authMiddleware , generateAndSavePPT); // Generate and save PPT
router.post("/material/get",authMiddleware , getMaterialsByCourseTutor); // Get the generated PPT
export const CourseRouter = router;
