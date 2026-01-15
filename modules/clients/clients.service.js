import { db } from "../../config/database.js";
import { Sequelize, Op } from "sequelize";

// ----------------------------------------------------
// 1️⃣ Add Client Service
// ----------------------------------------------------
export async function addClientService({ name, email, phone, address, amount }) {
  return await db.Client.create({
    name,
    email,
    phone,
    address,
    amount,
    status: "active",
  });
}

// ----------------------------------------------------
// 2️⃣ Get Clients Service
// ----------------------------------------------------
export async function getClientsService() {
  return await db.Client.findAll({
    where: { status: { [Op.ne]: "deleted" } },
    order: [["createdAt", "DESC"]],
  });
}




// -------------------------------
// Get total hours per client
// -------------------------------
export async function getClientBilling(clientId, { startDate, endDate } = {}) {
  // Get all projects for this client
  const projects = await db.Project.findAll({
    where: { clientId },
    attributes: ["id", "name"],
  });

  if (!projects.length) return { clientId, totalHours: "00:00:00", projects: [] };

  const projectIds = projects.map(p => p.id);

  // Get all tasks for these projects
  const tasks = await db.Task.findAll({
    where: { projectId: { [Op.in]: projectIds } },
    attributes: ["id", "title", "projectId"],
  });

  if (!tasks.length) return { clientId, totalHours: "00:00:00", projects: [] };

  const taskIds = tasks.map(t => t.id);

  // Build filter for TaskTimeLog
  const logFilter = { taskId: { [Op.in]: taskIds } };
  if (startDate && endDate) {
    logFilter.createdAt = { [Op.between]: [startDate, endDate] };
  }

  const logs = await db.TaskTimeLog.findAll({
    where: logFilter,
    attributes: ["taskId", "durationSeconds"],
  });

  // Sum duration per task
  const taskTimeMap = {};
  logs.forEach(log => {
    if (!taskTimeMap[log.taskId]) taskTimeMap[log.taskId] = 0;
    taskTimeMap[log.taskId] += log.durationSeconds || 0;
  });

  // Sum per project
  const projectMap = {};
  tasks.forEach(task => {
    const seconds = taskTimeMap[task.id] || 0;
    if (!projectMap[task.projectId]) projectMap[task.projectId] = 0;
    projectMap[task.projectId] += seconds;
  });

  // Sum total client hours
  const totalSeconds = Object.values(projectMap).reduce((a, b) => a + b, 0);

  // Convert seconds to hh:mm:ss
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const projectsData = projects.map(p => ({
    projectId: p.id,
    projectName: p.name,
    hours: formatTime(projectMap[p.id] || 0),
  }));

  return {
    clientId,
    totalHours: formatTime(totalSeconds),
    projects: projectsData,
  };
}


export async function updateClientService(clientId, updateData) {
  const client = await db.Client.findByPk(clientId);
  if (!client) throw new Error("Client not found");

  await client.update(updateData);
  return client;
}


export async function deleteClientService(clientId) {
  const client = await db.Client.findByPk(clientId);
  if (!client) throw new Error("Client not found");
  // Soft delete: set status to 'deleted' and optionally set deletedAt timestamp
  await client.update({ status: "deleted", deletedAt: new Date() });
  return { message: "Client soft deleted successfully" };
}
