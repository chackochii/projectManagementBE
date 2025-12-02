import express from "express"; 
import { getUserWorkHours } from "../modules/taskTimeLog/taskTimeLogController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user-one-day/:userId", authMiddleware, getUserWorkHours);

export default router;