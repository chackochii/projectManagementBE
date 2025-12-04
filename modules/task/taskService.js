// services/taskService.js
import { db } from "../../config/database.js";
import { Op } from "sequelize";

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
  return await db.Task.findAll({
    where: { status, projectId },
    order: [["createdAt", "DESC"]],
  });
}


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

  // Close any previously open logs
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

  // Create new time log entry for this start
  await db.TaskTimeLog.create({
    taskId,
    userId,
    startTime: now,
    endTime: null,
    durationSeconds: 0,
  });

  // Update task
  return await task.update({
    status: "in-progress",
    startTime: now,
    endTime: null,
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
    status: "todo",
    endTime: now,
    hoursTaken: totalSeconds, // 🔥 Update new column
  });
};




export const getMonthlyReportService = async (range, userId, projectId) => {
  const now = new Date();
  let startDate, endDate;

  // ---- DATE RANGE ----
  if (range === "today") {
    startDate = new Date(now.setHours(0, 0, 0, 0));
    endDate = new Date(now.setHours(23, 59, 59, 999));
  } else if (range === "week") {
    const day = now.getDay(); // 0=Sunday
    startDate = new Date(now);
    startDate.setDate(now.getDate() - day);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  // ---- QUERY TASKS ----
  const whereClause = {
    updatedAt: { [Op.between]: [startDate, endDate] },
  };

  if (userId) whereClause.assigneeId = userId;
  if (projectId) whereClause.projectId = projectId;

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

  if (tasks.length === 0) {
    return {
      employees: [],
      summary: { todo: 0, inProgress: 0, review: 0, done: 0, total: 0, totalHours: 0 },
    };
  }

  // ---- EMPLOYEE REPORT ----
  const employeeMap = {};
  let totalHours = 0;

  tasks.forEach((task) => {
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

    employeeMap[empName].totalTasks += 1;

    // Status count
    if (task.status === "todo") employeeMap[empName].todo++;
    if (task.status === "in-progress" || task.status === "review") employeeMap[empName].inProgress++;
    if (task.status === "review") employeeMap[empName].review++;
    if (task.status === "done") employeeMap[empName].done++;

    // Hours worked
    if (task.startTime && task.endTime) {
      const diffHours = (new Date(task.endTime) - new Date(task.startTime)) / (1000 * 60 * 60);
      if (diffHours > 0) {
        employeeMap[empName].hoursWorked += diffHours;
        totalHours += diffHours;
      }
    }
  });

  // ---- SUMMARY ----
  const summary = {
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress" || t.status === "review").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
    total: tasks.length,
    totalHours: Number(totalHours.toFixed(2)),
  };

  const employeeArray = Object.values(employeeMap).map((e) => ({
    ...e,
    hoursWorked: Number(e.hoursWorked.toFixed(2)),
  }));

  return { employees: employeeArray, summary };
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
