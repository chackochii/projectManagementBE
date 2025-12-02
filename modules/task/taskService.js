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

  const totalHours = totalSeconds / 3600;

  // Update task
  return await task.update({
    status: "todo",
    endTime: now,
    hoursTaken: totalHours, // 🔥 Update new column
  });
};




export const getMonthlyReportService = async (month) => {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const tasks = await db.Task.findAll({
        where: {
            updatedAt: { [Op.between]: [startDate, endDate] }
        },
        include: [
            {
                model: db.User,
                as: "assignee",
                attributes: ["id", "name"]
            }
        ],
    });

    if (tasks.length === 0) {
        return {
            employees: [],
            summary: {
                todo: 0,
                inProgress: 0,
                review: 0,
                done: 0,
                total: 0,
                totalHours: 0
            }
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
                hoursWorked: 0, // 👈 NEW FIELD
            };
        }

        employeeMap[empName].totalTasks += 1;

        // ---- COUNT STATUS ----
        if (task.status === "todo") employeeMap[empName].todo++;
        if (task.status === "in-progress" || task.status === "review") employeeMap[empName].inProgress++;
        if (task.status === "review") employeeMap[empName].review++;
        if (task.status === "done") employeeMap[empName].done++;

        // ---- CALCULATE HOURS WORKED ----
        if (task.startTime && task.endTime) {
            const start = new Date(task.startTime);
            const end = new Date(task.endTime);

            const diffMs = end - start;      // difference in milliseconds
            const diffHours = diffMs / (1000 * 60 * 60); // convert to hours

            if (diffHours > 0) {
                employeeMap[empName].hoursWorked += diffHours;
                totalHours += diffHours;
            }
        }
    });

    // ---- SUMMARY REPORT ----
    const summary = {
        todo: tasks.filter((t) => t.status === "todo").length,
        inProgress: tasks.filter((t) => t.status === "in-progress" || t.status === "review").length,
        review: tasks.filter((t) => t.status === "review").length,
        done: tasks.filter((t) => t.status === "done").length,
        total: tasks.length,
        totalHours: Number(totalHours.toFixed(2)), // 👈 total hours for entire team
    };

    // Round each employee's hours
    const employeeArray = Object.values(employeeMap).map((e) => ({
        ...e,
        hoursWorked: Number(e.hoursWorked.toFixed(2)),
    }));

    return {
        employees: employeeArray,
        summary,
    };
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
