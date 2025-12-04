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
            const now = new Date();
            const year = now.getFullYear();
            const mon = String(now.getMonth() + 1).padStart(2, "0");
            month = `${year}-${mon}`;
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
