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



export const getProjectUserTaskHoursService = async (projectId, userId) => {
  const tasks = await db.Task.findAll({
    where: { projectId },
    attributes: ["id", "title"],
  });

  if (!tasks.length) return [];

  const taskIds = tasks.map((t) => t.id);

  const logFilter = {
    taskId: { [Op.in]: taskIds }
  };

  if (userId) {
    logFilter.userId = userId;
  }

  const logs = await db.TaskTimeLog.findAll({
    where: logFilter,
    attributes: ["taskId", "durationSeconds", "userId"]
  });

  // Debug
  console.log("LOGS:", logs.map(l => l.toJSON()));

  const timeMap = {};

  logs.forEach((log) => {
    if (!timeMap[log.taskId]) timeMap[log.taskId] = 0;
    timeMap[log.taskId] += log.durationSeconds || 0;
  });

  let result = tasks.map((task) => {
    const seconds = timeMap[task.id] || 0;
    return {
      taskId: task.id,
      taskName: task.title,
      hoursTaken: Number((seconds / 3600).toFixed(2)),
    };
  });

  // Only show tasks worked by user
  if (userId) {
    result = result.filter((t) => t.hoursTaken > 0);
  }

  return result;
};

