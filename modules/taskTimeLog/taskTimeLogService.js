import { Op } from "sequelize";
import {db} from "../../config/database.js";

export const getUserWorkHoursService = async (userId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch logs only for today
  const logs = await db.TaskTimeLog.findAll({
    where: {
      userId,
      startTime: { [Op.between]: [startOfDay, endOfDay] },
    },
  });

  const totalSeconds = logs.reduce(
    (acc, log) => acc + (log.durationSeconds || 0),
    0
  );

  return totalSeconds
};


export const getProjectUserTaskHoursService = async (
  projectId,
  userId,
  range = "month"
) => {
  const now = new Date();
  let startDate, endDate;

  /* ---------- DATE RANGE ---------- */
  switch (range) {
    case "today":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "week": {
      const day = now.getDay(); // Sunday = 0
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }

    default: // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
  }

  /* ---------- FETCH TASKS ---------- */
  const tasks = await db.Task.findAll({
    where: { projectId },
    attributes: ["id", "title"],
  });

  if (!tasks.length) return [];

  const taskIds = tasks.map(t => t.id);

  /* ---------- LOG FILTER ---------- */
  const logFilter = {
    taskId: { [Op.in]: taskIds },
    createdAt: { [Op.between]: [startDate, endDate] },
  };

  if (userId) {
    logFilter.userId = userId;
  }

  /* ---------- FETCH LOGS ---------- */
  const logs = await db.TaskTimeLog.findAll({
    where: logFilter,
    attributes: ["taskId", "durationSeconds", "userId"],
  });

  /* ---------- AGGREGATION ---------- */
  const timeMap = {};

  logs.forEach(log => {
    if (!timeMap[log.taskId]) timeMap[log.taskId] = 0;
    timeMap[log.taskId] += log.durationSeconds || 0;
  });

  let result = tasks.map(task => {
    const seconds = timeMap[task.id] || 0;
    return {
      taskId: task.id,
      taskName: task.title,
      hoursTaken: Number((seconds / 3600).toFixed(2)),
    };
  });

  // Show only tasks worked in selected range
  result = result.filter(t => t.hoursTaken > 0);

  return result;
};
