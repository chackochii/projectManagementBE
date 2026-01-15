// services/taskService.js
import { db } from "../../config/database.js";
import { Op, Sequelize } from "sequelize";

export const createTaskService = async (data, user, assigneeName) => {
  const { title, description, priority, assigneeId, projectId } = data;

  return await db.Task.create({
    title,
    description,
    priority,
    assigneeId,
    reporterId: user?.id,
    status: "backlog",
    name: assigneeName,
    projectId,
  });
};

export const getBacklogTasksService = async (projectId) => {
  return await db.Task.findAll({
    where: {
      status: "backlog",
      projectId: projectId,
    },
    order: [["createdAt", "DESC"]],
  });
};


export const updateTaskStatusService = async (taskId, status) => {
  const task = await db.Task.findByPk(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  task.status = status;
  task.updatedAt = new Date();
  await task.save();

  return task;
};


export const getTasksByStatusService = async (status, projectId) => {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  return await db.Task.findAll({
    where: {
      status,
      projectId,
      createdAt: {
        [Op.gte]: twoWeeksAgo,
      },
    },
    order: [["createdAt", "DESC"]],
  });
};


export const getActiveTasksForUserService = async (userId, projectId) => {
  const validStatuses = ["todo", "in-progress", "review"];

  return await db.Task.findAll({
    where: {
      assigneeId: userId,
      projectId: projectId,
      status: validStatuses,
    },
    order: [["updatedAt", "DESC"]],
  });
};

//! Start Task
export const startTaskService = async (taskId, userId) => {
  const task = await db.Task.findByPk(taskId);
  if (!task) throw new Error("Task not found");
  if (task.assigneeId !== userId) throw new Error("Unauthorized");

  const now = new Date();

  // 1️⃣ Check if any other task is running for this user
  const runningTask = await db.Task.findOne({
    where: {
      assigneeId: userId,
      isRunning: true,
      status: "in-progress",
      id: { [Sequelize.Op.ne]: taskId }, // exclude current task
    },
  });

  // 2️⃣ Close any previously open logs for this task
  await db.TaskTimeLog.update(
    { endTime: now },
    {
      where: {
        taskId,
        userId,
        endTime: null,
      },
    }
  );

  // 3️⃣ Create new time log entry for this task
  await db.TaskTimeLog.create({
    taskId,
    userId,
    startTime: now,
    endTime: null,
    durationSeconds: 0,
  });

  // 4️⃣ Determine if current task should be running
  const isRunning = !runningTask; // true if no other task is running

  // 5️⃣ Update the current task
  return await task.update({
    status: "in-progress",
    startTime: now,
    endTime: null,
    isRunning,
  });
};




export const stopTaskService = async (taskId, userId) => {
  const task = await db.Task.findByPk(taskId);
  if (!task) throw new Error("Task not found");
  if (task.assigneeId !== userId) throw new Error("Unauthorized");

  const now = new Date();

  // Find active unfinished time log
  const activeLog = await db.TaskTimeLog.findOne({
    where: { taskId, userId, endTime: null },
  });

  if (activeLog) {
    const durationMs = now - activeLog.startTime;
    const durationSeconds = Math.floor(durationMs / 1000);

    await activeLog.update({
      endTime: now,
      durationSeconds,
    });
  }

  // 🔥 Recalculate total time spent on this task
  const logs = await db.TaskTimeLog.findAll({
    where: { taskId },
  });

  const totalSeconds = logs.reduce(
    (acc, log) => acc + (log.durationSeconds || 0),
    0
  );

  // const totalHours = totalSeconds / 3600;

  // Update task
  return await task.update({
    isRunning: false, 
    endTime: now,
    hoursTaken: totalSeconds, // 🔥 Update new column
  });
};



export const getMonthlyReportService = async (range, userId, projectId) => {
  const now = new Date();
  let startDate, endDate;

  // ---------- DATE RANGE (UTC SAFE) ----------
  if (range === "today") {
    startDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    endDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));
  }

  else if (range === "week") {
    const day = now.getUTCDay(); // 0 = Sunday
    startDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - day,
      0, 0, 0, 0
    ));
    endDate = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate() + 6,
      23, 59, 59, 999
    ));
  }

  else {
    // month (default)
    startDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1,
      0, 0, 0, 0
    ));
    endDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      0,
      23, 59, 59, 999
    ));
  }

  // ---------- WHERE CLAUSE (FIXED) ----------
  const whereClause = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

  if (userId) whereClause.assigneeId = userId;
  if (projectId) whereClause.projectId = projectId;

  // ---------- QUERY ----------
  const tasks = await db.Task.findAll({
    where: whereClause,
    include: [
      {
        model: db.User,
        as: "assignee",
        attributes: ["id", "name"],
      },
      {
        model: db.Project,
        as: "project",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!tasks.length) {
    return {
      employees: [],
      summary: {
        todo: 0,
        inProgress: 0,
        review: 0,
        done: 0,
        total: 0,
        totalHours: 0,
      },
    };
  }

  // ---------- EMPLOYEE AGGREGATION ----------
  const employeeMap = {};
  let totalHours = 0;

  for (const task of tasks) {
    const empName = task.assignee?.name || "Unassigned";

    if (!employeeMap[empName]) {
      employeeMap[empName] = {
        employee: empName,
        totalTasks: 0,
        todo: 0,
        inProgress: 0,
        review: 0,
        done: 0,
        hoursWorked: 0,
      };
    }

    const emp = employeeMap[empName];
    emp.totalTasks++;

    if (task.status === "todo") emp.todo++;
    if (task.status === "in-progress") emp.inProgress++;
    if (task.status === "review") {
      emp.inProgress++;
      emp.review++;
    }
    if (task.status === "done") emp.done++;

    // hoursTaken assumed in SECONDS
    if (task.hoursTaken && task.hoursTaken > 0) {
      const hours = task.hoursTaken / 3600;
      emp.hoursWorked += hours;
      totalHours += hours;
    }
  }

  // ---------- SUMMARY ----------
  const summary = {
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t =>
      ["in-progress", "review"].includes(t.status)
    ).length,
    review: tasks.filter(t => t.status === "review").length,
    done: tasks.filter(t => t.status === "done").length,
    total: tasks.length,
    totalHours: Number(totalHours.toFixed(2)),
  };

  const employees = Object.values(employeeMap).map(emp => ({
    ...emp,
    hoursWorked: Number(emp.hoursWorked.toFixed(2)),
  }));

  return { employees, summary };
};






// const Task = db.Task;


export const getUserTasksGroupedService = async (userId, projectId) => {
  try {
    console.log("UserId:", userId, "ProjectId:", projectId);

    const tasks = await db.Task.findAll({
      where: {
        assigneeId: userId,
        projectId: projectId,
      },
      attributes: ["status"], // ✅ only fetch status, more efficient
    });

    // Count tasks
    const counts = {
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
      backlog: 0,
      total: tasks.length,
    };

    tasks.forEach((task) => {
      if (task.status === "todo") counts.todo++;
      else if (task.status === "in-progress") counts.inProgress++;
      else if (task.status === "review") counts.review++;
      else if (task.status === "done") counts.done++;
      else if (task.status === "backlog") counts.backlog++;
    });

    return { success: true, counts };
  } catch (err) {
    console.error("TASK GROUP ERROR:", err);
    return { success: false, message: "Server error" };
  }
};

export const assignTaskService = async ({ taskId, assigneeId, user, name }) => {
  // Fetch task
  const task = await db.Task.findByPk(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.status = 404;
    throw error;
  }

  // Fetch assignee


  // Optional: prevent assigning completed tasks
  if (task.status === "done") {
    const error = new Error("Cannot assign a completed task");
    error.status = 400;
    throw error;
  }

  // Update task
  await task.update({
    assigneeId,
    name,
    updatedBy: user?.id,
  });

  return task;
};


export const unassignTaskService = async ({ taskId, user }) => {
  const task = await db.Task.findByPk(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.status = 404;
    throw error;
  }

  // Optional: prevent unassigning completed tasks
  if (task.status === "done") {
    const error = new Error("Cannot unassign a completed task");
    error.status = 400;
    throw error;
  }

  await task.update({
    assigneeId: null,
    name: "Unassigned",
    updatedBy: user?.id,
  });

  return task;
};


export const getUserTasksReportService = async ({
  userId,
  range = "month",
  projectId,
  status, // optional
}) => {
  const now = new Date();
  let startDate, endDate;

  /* ---------- DATE RANGE (LOCAL SAFE) ---------- */
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
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  /* ---------- WHERE CLAUSE (FIXED) ---------- */
  const whereClause = {
    assigneeId: userId,
    endTime: {
      [Op.not]: null,
      [Op.between]: [startDate, endDate],
    },
  };

  // Optional status filter (only if explicitly passed)
  if (status) {
    whereClause.status = status;
  }

  if (projectId) {
    whereClause.projectId = projectId;
  }

  /* ---------- QUERY ---------- */
  const tasks = await db.Task.findAll({
    where: whereClause,
    include: [
      {
        model: db.Project,
        as: "project",
        attributes: ["id", "name"],
      },
    ],
    order: [["endTime", "DESC"]],
  });

  /* ---------- AGGREGATION ---------- */
  let totalHours = 0;

  const taskList = tasks.map(task => {
    const hours =
      task.hoursTaken && task.hoursTaken > 0
        ? task.hoursTaken / 3600 // ✅ seconds → hours
        : 0;

    totalHours += hours;

    return {
      id: task.id,
      title: task.title,
      status: task.status,
      project: task.project?.name || null,
      hoursWorked: Number(hours.toFixed(2)),
      completedAt: task.endTime,
    };
  });

  return {
    userId,
    range,
    totalTasks: tasks.length,
    totalHours: Number(totalHours.toFixed(2)),
    tasks: taskList,
  };
};
