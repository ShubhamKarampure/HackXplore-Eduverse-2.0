import express from "express";
import { createModule,  updateModule, deleteModule, getModuleDetails, generateModules } from "../controllers/moduleController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Teacher Actions
router.post("/", authMiddleware,createModule);
router.get("/generate/:id",authMiddleware, generateModules);

router.get("/:moduleId", authMiddleware, getModuleDetails);
router.patch("/:moduleId", authMiddleware, updateModule);
router.delete("/:id",authMiddleware, deleteModule);

export const ModuleRouter = router;
