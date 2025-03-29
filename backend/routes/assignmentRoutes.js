import express from "express";
import { 
  createAssignmentController,
  deleteAssignmentController,
  updateAssignmentController,
  getAssignmentByModuleId,
  submitAssignment,
  getAssignmentsByCourseController,
  gradeAssignmentController,
  getAssignmentByStudent,
  generateAssignment
} from "../controllers/assignmentControllers.js";

const router = express.Router();

// Public routes
// Retrieve an assignment by module ID
router.get("/:moduleId", getAssignmentByModuleId);
router.get("/course/:courseId", getAssignmentsByCourseController);
router.get("/student/:id", getAssignmentByStudent);

// Generate assignment with AI
router.post("/generate", generateAssignment);

// Teacher actions
// Create a new assignment linked to a module
router.post("/:moduleId", createAssignmentController);

// Update an assignment
router.put("/:id", updateAssignmentController);

// Delete an assignment
router.delete("/:id", deleteAssignmentController);

// Student actions
router.post("/submit/:id", submitAssignment);

// Grading
router.post("/grade/:assignmentId/:studentId", gradeAssignmentController);

export const assignmentRouter = router;