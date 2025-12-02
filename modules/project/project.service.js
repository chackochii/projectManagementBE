import { db } from "../../config/database.js";



export const createProjectService = async (data) => {
    const Project = db.Project;

  return await Project.create({
    name: data.name,
    description: data.description || null,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    status: data.status || "active",
  });
};

export const listProjectsService = async () => {
    const Project = db.Project;
  return await Project.findAll({
    include: [
      {
        model: db.Task,
        as: "tasks",
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

  await project.destroy();
  return true;
};

