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
  getSubmissionStatus,
  getDeadlines
} from "../controllers/assignmentControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// Public routes
// Retrieve an assignment by module ID
router.get("/:moduleId",authMiddleware, getAssignmentByModuleId);
router.get("/course/:courseId", authMiddleware,getAssignmentsByCourseController);
router.get("/student/:id",authMiddleware, getAssignmentByStudent);

// Teacher actions
// Create a new assignment linked to a module
router.post("/:moduleId",authMiddleware, createAssignmentController);

// Update an assignment
router.put("/:id", authMiddleware,updateAssignmentController);

// Delete an assignment
router.delete("/:id",authMiddleware, deleteAssignmentController);

// Student actions
router.post("/student/submit",authMiddleware, submitAssignment);

// Grading
router.post("/grade/:assignmentId", authMiddleware,gradeAssignmentController);

// Submission Statue
router.get("/status/:assignmentId", authMiddleware, getSubmissionStatus);

router.get("/user/deadlines", authMiddleware, getDeadlines);

export const assignmentRouter = router;