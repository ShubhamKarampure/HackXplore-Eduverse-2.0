import express from "express";
import {
  createProgress,
  getProgress,
  updateProgress,
  deleteProgress,
  updateQuizAttempt
} from "../controllers/progressController.js";

const router = express.Router();

// Create a new progress record
router.post("/", createProgress);

// Read a progress record
router.get("/:studentId/:courseId", getProgress);

// Update a progress record
router.put("/:studentId/:courseId", updateProgress);
router.put("updateQuiz/:studentId/:courseId", updateQuizAttempt);

// Delete a progress record
router.delete("/:studentId/:courseId", deleteProgress);




export const progressRouter = router;