// modules/leave/leave.service.js

import { db } from "../../config/database.js";

// ----------------------------------------------------
// 1️⃣ Request Leave
// ----------------------------------------------------
export async function requestLeaveService(userId, startDate, endDate, leaveType, reason, email, role) {
  return await db.Leave.create({
    userId,
    startDate,
    endDate,
    leaveType,
    reason,
    status: "PENDING",
    email,
    role,
  });
}

// ----------------------------------------------------
// 2️⃣ Approve Leave
// ----------------------------------------------------
export async function approveLeaveService(leaveId) {
  const leave = await db.Leave.findByPk(leaveId);
  if (!leave) throw new Error("Leave not found");

  await leave.update({ status: "APPROVED" });
  return leave;
}

// ----------------------------------------------------
// 3️⃣ Reject Leave
// ----------------------------------------------------
export async function rejectLeaveService(leaveId) {
  const leave = await db.Leave.findByPk(leaveId);
  if (!leave) throw new Error("Leave not found");

  await leave.update({ status: "REJECTED" });
  return leave;
}

// ----------------------------------------------------
// 4️⃣ Get all leaves of one user
// ----------------------------------------------------
export async function getUserLeavesService(userId) {
  return await db.Leave.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });
}

// ----------------------------------------------------
// 5️⃣ Admin → Get all pending leaves
// ----------------------------------------------------
export async function getAllPendingLeavesService() {
  return await db.Leave.findAll({
    where: { status: "PENDING" },
    order: [["createdAt", "DESC"]],
  });
}

export async function getAllLeavesService() {
  return await db.Leave.findAll({
    order: [["createdAt", "DESC"]],
  });
}