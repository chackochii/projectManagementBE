import { addUserToProject, getProjectMembers, getProjectsForUser,removeUserFromProject } from "../modules/projectMember/projectMemberController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectMemberUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         name:
 *           type: string
 *           example: Edwin Chacko
 *         email:
 *           type: string
 *           example: edwin@example.com
 *         role:
 *           type: string
 *           example: developer
 *         createdAt:
 *           type: string
 *           format: date-time
 */


router.post("/:projectId/add-user", authMiddleware, addUserToProject);



/**
 * @swagger
 * /project-members/{projectId}/members:
 *   get:
 *     summary: Get all members of a project
 *     tags: [Project Members]
 *     description: Returns all users assigned to a specific project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: List of project members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 members:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectMemberUser'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

router.get("/:projectId/members", authMiddleware, getProjectMembers);

router.get("/user/:userId/projects", authMiddleware, getProjectsForUser);
router.delete("/:projectId/remove-user/:userId", authMiddleware, removeUserFromProject);



export default router;
