import { db } from "../../config/database.js";



export const createProjectService = async (data) => {
  const Project = db.Project;
  const Client = db.Client;

  let clientName = null;
  let clientEmail = null;
  let clientPhone = null;

  if (data.clientId) {
    const client = await Client.findByPk(data.clientId);

    if (!client) {
      throw new Error("Client not found");
    }

    clientName = client.name;
    clientEmail = client.email;
    clientPhone = client.phone;
  }

  return await Project.create({
    name: data.name,
    description: data.description || null,
    clientId: data.clientId || null,
    clientName,
    clientEmail,
    clientPhone,
    status: data.status || "active",
  });
};


export const listProjectsService = async () => {
  return await db.Project.findAll({
    include: [
      {
        model: db.Task,
        as: "tasks",
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};


export const getProjectByIdService = async (id) => {
    const Project = db.Project;
  return await Project.findOne({
    where: { id },
    include: [{ model: db.Task, as: "tasks" }],
  });
};

export const updateProjectService = async (id, updateData) => {
    const Project = db.Project;
  const project = await Project.findByPk(id);
  if (!project) return null;

  await project.update(updateData);
  return project;
};


export const deleteProjectService = async (id) => {
  const Project = db.Project;

  const project = await Project.findByPk(id);
  if (!project) return null;

  await project.destroy(); // 🔥 SOFT DELETE
  return true;
};


// project cost projection api (in admin page called cost estimation)

export const getProjectCostService = async (projectId) => {
  const Task = db.Task;
  const User = db.User;

  const tasks = await Task.findAll({
    where: { projectId },
    attributes: ["id", "title", "hoursTaken"],
    include: [
      {
        model: User,
        as: "assignee",
        attributes: ["id", "name", "hourlyRate"],
      },
    ],
  });

  let totalCost = 0;
  let totalHours = 0;

  const taskCosts = tasks.map((task) => {
    const hours = task.hoursTaken || 0;
    const rate = task.assignee?.hourlyRate || 0;

    const cost = hours/3600 * rate;

    totalHours += hours;
    totalCost += cost;

    return {
      taskId: task.id,
      taskTitle: task.title,
      employee: task.assignee?.name || "Unassigned",
      hours,
      rate,
      cost,
    };
  });

  return {
    totalHours,
    totalCost,
    tasks: taskCosts,
  };
};

