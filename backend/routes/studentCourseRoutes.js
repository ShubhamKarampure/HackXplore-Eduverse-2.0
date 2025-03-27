import express from "express";
import {
  getAllCourses,
  enrollCourse,
  getMyCourses
  /*
  getEnrolledCourses,
  getCourseDetails,
  unenrollStudent,
  findSimilarCourses,*/
} from "../controllers/courseControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// Public - Get all available courses
router.get("/",authMiddleware , getAllCourses); // Matches /api/v1/user/student/course/

// Student Actions
router.post("/enroll",authMiddleware , enrollCourse); // Enroll in a course
router.get("/enrolled",authMiddleware, getMyCourses); // Get all enrolled courses for the logged-in student

/*
router.get("/:courseId", getCourseDetails); // Get course details
router.delete("/:courseId/unenroll", unenrollStudent); // Unenroll from a course

// Additional Features
router.get("/:courseId/similar", findSimilarCourses); // Find similar courses
router.post("/quiz/:courseId", submitQuiz); // Submit quiz
*/
export const studentCourseRouter = router;
