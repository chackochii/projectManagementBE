// routes/taskRoutes.js
import express from "express";
import { createTask, getBacklogTasks, updateTaskStatus, getTasksByStatus, getActiveTasksForUser, startTask, stopTask, getMonthlyReport,getUserTasksController, assignTask, unassignTask, getUserTasksReport, getUserTasksFullDetailsController} from "../modules/task/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createTask);
router.get("/backlog/:projectId", authMiddleware, getBacklogTasks);
router.patch("/status", authMiddleware, updateTaskStatus);
router.get("/status/:status/:projectId", authMiddleware, getTasksByStatus);

router.get("/my-active-tasks/:projectId", authMiddleware, getActiveTasksForUser);
router.post("/start/:taskId", authMiddleware, startTask);
router.post("/end/:taskId", authMiddleware, stopTask);

router.get("/monthly", authMiddleware, getMonthlyReport);

router.get("/user-tasks/:projectId", authMiddleware, getUserTasksController);

router.patch("/assign", authMiddleware, assignTask);
router.patch("/unassign", authMiddleware, unassignTask);

router.get("/user-tasks", authMiddleware, getUserTasksReport );

router.get("/tasksDetails", authMiddleware, getUserTasksFullDetailsController )








export default router;
