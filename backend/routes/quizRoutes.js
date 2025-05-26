import express from "express";
import { 
  createQuiz, 
  getQuizByModuleId, 
  updateQuiz, 
  deleteQuiz, 
  generateQuiz
} from "../controllers/quizController.js";

const router = express.Router();

// public 
// Retrieve a quiz by module ID
router.get("/:moduleId", getQuizByModuleId);
router.post("/generate", generateQuiz);
router.post("/quiz/feedback", generateQuiz);
// teacher actions

// Create a new quiz linked to a module
router.post("/:moduleId", createQuiz);

// Update a quiz
router.put("/:id", updateQuiz);

// Delete a quiz
router.delete("/:id", deleteQuiz);

export const quizRouter = router;