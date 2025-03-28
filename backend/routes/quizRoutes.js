import express from "express";
import { 
  createQuiz, 
  getQuizByModuleId, 
  updateQuiz, 
  deleteQuiz 
} from "../controllers/quizController.js";

const router = express.Router();

// public 
// Retrieve a quiz by module ID
router.get("/:moduleId", getQuizByModuleId);

// teacher actions

// Create a new quiz linked to a module
router.post("/:moduleId", createQuiz);

// Update a quiz
router.put("/:id", updateQuiz);

// Delete a quiz
router.delete("/:id", deleteQuiz);

export const quizRouter = router;