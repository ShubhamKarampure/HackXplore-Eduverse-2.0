import express from "express";
import {
  createCourse,
  getAllCourses,
  enrollCourse,
  getMyCourses,
  getCourseDetails
  /*
  getEnrolledCourses,
  unenrollStudent,
  findSimilarCourses,*/
} from "../controllers/courseControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// Public - Get all available courses
router.get("/",authMiddleware , getAllCourses); // Matches /api/v1/user/student/course/
router.get("/my-courses", authMiddleware, getMyCourses); // Get all enrolled courses for the logged-in student
router.get("/:courseId",authMiddleware, getCourseDetails); // Get course details

// Student Actions
router.post("/student/enroll",authMiddleware , enrollCourse); // Enroll in a course

// Teacher Action
router.post("/", authMiddleware, createCourse);

/*


router.delete("/:courseId/unenroll", unenrollStudent); // Unenroll from a course

// Additional Features
router.get("/:courseId/similar", findSimilarCourses); // Find similar courses
router.post("/quiz/:courseId", submitQuiz); // Submit quiz
*/
export const CourseRouter = router;
