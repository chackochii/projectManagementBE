// modules/leave/leave.controller.js
import {
  requestLeaveService,
  approveLeaveService,
  rejectLeaveService,
  getUserLeavesService,
  getAllPendingLeavesService,
getAllLeavesService,
} from "./leaves.service.js";

const leaveTypeMap = {
  "Sick Leave": "SICK",
  "Casual Leave": "CASUAL",
  "Work From Home": "OTHER",
  "Emergency Leave": "OTHER",
};


export const requestLeave = async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;
    let leaveType = leaveTypeMap[type] || "OTHER";

    const userId = req.user?.id || 1;
    const email = req.user?.email || "<Email not found>";
    const role = req.user?.role || "DEVELOPER";

    console.log("User requesting leave:", { userId, email, role });

    const leave = await requestLeaveService(
      userId,
      startDate,
      endDate,
      leaveType,
      reason,
      email,
      role,
    );

    res.json({
      message: "Leave requested successfully",
      leave,
    });
  } catch (err) {
    // console.log(err);       
    res.status(400).json({ error: err.message });
  }
};


export const approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leave = await approveLeaveService(leaveId);

    res.json({
      message: "Leave approved",
      leave,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leave = await rejectLeaveService(leaveId);

    res.json({
      message: "Leave rejected",
      leave,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user?.id || 0;
    const leaves = await getUserLeavesService(userId);

    res.json({ leaves });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await getAllPendingLeavesService();

    res.json({ leaves });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await getAllLeavesService(); // Assuming this returns all leaves if no userId is provided
    res.json({ leaves });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
