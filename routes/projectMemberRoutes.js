import { addUserToProject, getProjectMembers, getProjectsForUser,removeUserFromProject } from "../modules/projectMember/projectMemberController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

router.post("/:projectId/add-user", authMiddleware, addUserToProject);
router.get("/:projectId/members", authMiddleware, getProjectMembers);

router.get("/user/:userId/projects", authMiddleware, getProjectsForUser);
router.delete("/:projectId/remove-user/:userId", authMiddleware, removeUserFromProject);



export default router;
