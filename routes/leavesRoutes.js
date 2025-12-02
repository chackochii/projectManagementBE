import express from "express";
import {
  requestLeave,
  approveLeave,
  rejectLeave,
  getMyLeaves,
  getPendingLeaves,
  getAllLeaves,
} from "../modules/leaves/leaves.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE leave request
router.post("/request", authMiddleware, requestLeave);

// USER: Get own leaves
router.get("/user/:userId", authMiddleware, getMyLeaves);

router.get("/", authMiddleware, getAllLeaves);

// ADMIN: Approve
router.put("/approve/:leaveId", authMiddleware, approveLeave);

// ADMIN: Reject
router.put("/reject/:leaveId", authMiddleware, rejectLeave);

// ADMIN: all pending
router.get("/pending", authMiddleware, getPendingLeaves);

export default router;
