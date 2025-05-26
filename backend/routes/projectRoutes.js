import { getAllProjects,createProject,getProjectById } from "../controllers/projectController.js";
import express from "express";

const router = express.Router();

router.route("/").get(getAllProjects).post(createProject);
router.route("/:id").get(getProjectById)

export default router;