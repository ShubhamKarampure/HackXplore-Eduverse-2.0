import express from "express";
import { createModule, getModuleById, updateModule, deleteModule, generateModules } from "../controllers/moduleController.js";

const router = express.Router();

router.post("/", createModule);
router.get("/generate/:id", generateModules);

router.get("/:id", getModuleById);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

export const ModuleRouter = router;
