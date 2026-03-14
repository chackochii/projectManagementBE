/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs
 */
import { Router } from "express";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectCost,
} from "../modules/project/project.controller.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const router = Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Website Redesign
 *         description:
 *           type: string
 *           example: Redesign company website
 *         clientId:
 *           type: integer
 *           example: 5
 *         clientName:
 *           type: string
 *           example: John Doe
 *         clientEmail:
 *           type: string
 *           example: john@example.com
 *         clientPhone:
 *           type: string
 *           example: "+919876543210"
 *         status:
 *           type: string
 *           example: active
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// Create project

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: HR Management System
 *               description:
 *                 type: string
 *                 example: Internal HR management platform
 *               clientId:
 *                 type: integer
 *                 example: 3
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Project name is required
 *       500:
 *         description: Server error
 */

router.post("/", authMiddleware, createProject);

// List all projects

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       500:
 *         description: Server error
 */

router.get("/", authMiddleware, listProjects);

// Get project by ID

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getProject);

// Update project
router.put("/:id", authMiddleware, updateProject);

// Delete project
router.delete("/:id", authMiddleware, deleteProject);

router.get("/:projectId/cost", authMiddleware, getProjectCost);


export default router;
