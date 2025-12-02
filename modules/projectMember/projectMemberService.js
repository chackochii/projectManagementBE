// services/projectService.js

import { db } from "../../config/database.js";
import { Op } from "sequelize";

export const addUserToProjectService = async ({ projectId, userId, role }) => {
  // Check if project exists
  const project = await db.Project.findByPk(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  // Check if user exists
  const user = await db.User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is already added to project
  const existing = await db.ProjectMember.findOne({
    where: { projectId, userId },
  });

  if (existing) {
    throw new Error("User is already a member of this project");
  }

  // Add user
  return await db.ProjectMember.create({
    projectId,
    userId,
    role: role || "member",
  });
};

// ✔ OPTIONAL — Get all members of a project

export const getProjectMembersService = async (projectId) => {
  const project = await db.Project.findByPk(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const members = await db.ProjectMember.findAll({
    where: { projectId },
    include: [{ model: db.User, as: "user" }], // make sure alias matches your association
  });

  const formatted = members.map((m) => m.user); // send only the user info
  return { data: formatted };
};



export const getProjectsForUserService = async (userId) => {
  const memberships = await db.ProjectMember.findAll({
    where: { userId },
    include: [
      {
        model: db.Project,
        as: "project",
        attributes: ["id", "name", "clientName", "status", "createdAt"],
      },
    ],
  });

  return memberships.map((m) => m.project);
};