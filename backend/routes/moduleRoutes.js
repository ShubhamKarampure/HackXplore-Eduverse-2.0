import express from "express";
import { createModule,  updateModule, deleteModule, generateModules } from "../controllers/moduleController.js";

const router = express.Router();

// Teacher Actions
router.post("/", createModule);
router.get("/generate/:id", generateModules);

router.put("/:moduleId", updateModule);
router.delete("/:id", deleteModule);

export const ModuleRouter = router;
