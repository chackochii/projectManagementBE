import { Op } from "sequelize";
import {db} from "../../config/database.js";

export const getUserWorkHoursService = async (userId) => {

  const now = new Date();

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,0,0,0
  );

  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,59,59,999
  );

  const logs = await db.TaskTimeLog.findAll({
    where: {
      userId: Number(userId),
      startTime: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
  });

  const totalSeconds = logs.reduce(
    (acc, log) => acc + (log.durationSeconds || 0),
    0
  );

  return totalSeconds;
};


export const getProjectUserTaskHoursService = async (
  projectId,
  userId,
  range = "month"
) => {

  console.log("\n=== SERVICE START ===");

  const now = new Date();
  console.log("Current server time:", now);

  let startDate;
  let endDate;

  if (range === "today") {

    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23,59,59,999);

  }

  else if (range === "week") {

    const firstDay = now.getDate() - now.getDay();

    startDate = new Date(now);
    startDate.setDate(firstDay);
    startDate.setHours(0,0,0,0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23,59,59,999);

  }

  else {

    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0,0,0,0);

    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23,59,59,999);

  }

  console.log("Computed startDate:", startDate);
  console.log("Computed endDate:", endDate);


  // STEP 1: Fetch tasks
  const tasks = await db.Task.findAll({
    where: {
      projectId: Number(projectId),
    },
    attributes: ["id", "title", "projectId"],
  });

  console.log("Tasks found:", tasks.length);
  console.log("Tasks data:", tasks.map(t => t.toJSON()));


  if (!tasks.length) {
    console.log("❌ No tasks found for project");
    return [];
  }

  const taskIds = tasks.map(t => t.id);

  console.log("Task IDs:", taskIds);


  // STEP 2: Build log filter
  const logFilter = {

    taskId: {
      [Op.in]: taskIds,
    },

    startTime: {
      [Op.between]: [startDate, endDate],
    },

  };

  if (userId) {
    logFilter.userId = Number(userId);
  }

  console.log("Log filter:", logFilter);


  // STEP 3: Fetch logs
  const logs = await db.TaskTimeLog.findAll({

    where: logFilter,

    attributes: [
      "taskId",
      "durationSeconds",
      "userId",
      "startTime",
      "endTime"
    ],

  });

  console.log("Logs found:", logs.length);

  if (logs.length) {
    console.log("Sample log:", logs[0].toJSON());
  } else {
    console.log("❌ No logs matched filter");
  }


  // STEP 4: Aggregate
  const timeMap = {};

  for (const log of logs) {

    if (!timeMap[log.taskId])
      timeMap[log.taskId] = 0;

    timeMap[log.taskId] += log.durationSeconds;

  }

  console.log("Time map:", timeMap);


  // STEP 5: Build result
  const result = tasks
    .map(task => {

      const seconds = timeMap[task.id] || 0;

      return {

        taskId: task.id,

        taskName: task.title,

        hoursTaken: Number((seconds)),

      };

    })

  console.log("Final result:", result);

  console.log("=== SERVICE END ===\n");

  return result;

};


