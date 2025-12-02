import { Router } from "express";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../modules/project/project.controller.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const router = Router();

// Create project
router.post("/", authMiddleware, createProject);

// List all projects
router.get("/", authMiddleware, listProjects);

// Get project by ID
router.get("/:id", authMiddleware, getProject);

// Update project
router.put("/:id", authMiddleware, updateProject);

// Delete project
router.delete("/:id", authMiddleware, deleteProject);

export default router;
