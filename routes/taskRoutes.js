// routes/taskRoutes.js
import express from "express";
import { createTask, getBacklogTasks, updateTaskStatus, getTasksByStatus, getActiveTasksForUser, startTask, stopTask, getMonthlyReport,getUserTasksController, assignTask, unassignTask} from "../modules/task/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createTask);
router.get("/backlog/:projectId", authMiddleware, getBacklogTasks);
router.patch("/status", authMiddleware, updateTaskStatus);
router.get("/status/:status/:projectId", authMiddleware, getTasksByStatus);

router.get("/my-active-tasks/:projectId", authMiddleware, getActiveTasksForUser);
router.post("/start/:taskId", startTask);
router.post("/end/:taskId", stopTask);

router.get("/monthly", authMiddleware, getMonthlyReport);

router.get("/user-tasks/:projectId", authMiddleware, getUserTasksController);

router.patch("/assign", authMiddleware, assignTask);
router.patch("/unassign", authMiddleware, unassignTask);







export default router;
