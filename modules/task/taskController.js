// controllers/taskController.js
import {
  createTaskService,
  getBacklogTasksService,
  updateTaskStatusService,
  getTasksByStatusService,
  getActiveTasksForUserService,
  startTaskService,
  stopTaskService,
  getMonthlyReportService,
  getUserTasksGroupedService,
  unassignTaskService,
  assignTaskService,
  getUserTasksReportService,
  getUserTasksFullDetailsService,
} from "./taskService.js";
import { getUserById } from "../user/user.service.js";
import { Op } from "sequelize";

export const createTask = async (req, res) => {
  try {
    const { title, description, type, priority, assigneeId, projectId } = req.body;
    const name = await getUserById(assigneeId);
    const assigneeName = name?.name || "Unassigned";
    console.log(projectId, "projectId");
    if(!title || !description || !type || !priority || !assigneeId || !projectId){
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = req?.user || 1;
    console.log("Reporter ID:", user);
    const task = await createTaskService(req.body, user, assigneeName);
    return res.json({
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getBacklogTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const tasks = await getBacklogTasksService(projectId);
    return res.json(tasks);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


export const updateTaskStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Task ID and status are required" });
    }

    const updatedTask = await updateTaskStatusService(id, status);

    return res.json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTasksByStatus = async (req, res) => {
  try {
    const { status, projectId } = req.params;
    const tasks = await getTasksByStatusService(status, projectId);
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


export const getActiveTasksForUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }
    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const tasks = await getActiveTasksForUserService(userId, projectId);

    return res.json({
      message: "Tasks loaded successfully",
      tasks,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const startTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updated = await startTaskService(taskId, req.user.id);
    res.json({ message: "Task started", task: updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const stopTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    // await updateTaskStatusService(taskId, "review");
    const updated = await stopTaskService(taskId, req.user.id);
    console.log("Updated Task after stopping:", updated);
    res.json({ message: "Task ended", task: updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};


export const getMonthlyReport = async (req, res) => {
    try {
          let { range, userId, projectId } = req.query;

        if (!range) {
            range = "currentMonth";
        }

        const report = await getMonthlyReportService(range, userId, projectId);

        if (report.summary.total === 0) {
            return res.json({ message: "No tasks available for this month", report });
        }

        return res.json(report);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


export const getUserTasksController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log("User ID in Controller:", userId, "Project ID:", projectId);

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    const result = await getUserTasksGroupedService(userId, projectId);

    return res.json({
      message: "User tasks loaded successfully",
      ...result, // includes success + counts
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};


export const assignTask = async (req, res) => {
  try {
    const { taskId, assigneeId } = req.body;

    if (!taskId || !assigneeId) {
      return res.status(400).json({
        error: "taskId and assigneeId are required",
      });
    }

      const assignee = await getUserById(assigneeId);
  if (!assignee) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

    const user = req.user;

    const task = await assignTaskService({
      taskId,
      assigneeId,
      user,
      name:assignee.name
    });

    return res.json({
      message: "Task assigned successfully",
      task,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.message,
    });
  }
};



export const unassignTask = async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        error: "taskId is required",
      });
    }

    const user = req.user;

    const task = await unassignTaskService({
      taskId,
      user,
    });

    return res.json({
      message: "Task unassigned successfully",
      task,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.message,
    });
  }
};


export const getUserTasksReport = async (req, res) => {
  try {
    const {
      userId,
      range,
      startDate,
      endDate,
      projectId,
      status
    } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const report = await getUserTasksReportService({
      userId,
      range,
      startDate,
      endDate,
      projectId,
      status,
    });

    if (!report.tasks.length) {
      return res.json({
        message: "No tasks found for the selected period",
        ...report,
      });
    }

    return res.json(report);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};





export const getUserTasksFullDetailsController = async (req, res) => {
  try {
    const { userId, projectId, status, priority, startDate, endDate } = req.query;

    // projectId is still required, optional: userId
    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const tasks = await getUserTasksFullDetailsService({
      userId: userId ? parseInt(userId) : null, // null means all users
      projectId: parseInt(projectId),
      status,
      priority,
      startDate,
      endDate,
    });

    return res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


