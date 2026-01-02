import express from "express"; 
import { getUserWorkHours, getProjectUserTaskHours } from "../modules/taskTimeLog/taskTimeLogController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user-one-day/:userId", authMiddleware, getUserWorkHours);
router.get("/:projectId", authMiddleware, getProjectUserTaskHours)

export default router;
