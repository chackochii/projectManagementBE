// controllers/projectController.js

import {
  addUserToProjectService,
  getProjectMembersService,
  getProjectsForUserService,
} from "./projectMemberService.js";

export const addUserToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    // Validate
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const data = await addUserToProjectService({
      projectId,
      userId,
      role,
    });

    return res.json({
      success: true,
      message: "User added to project successfully",
      data,
    });
  } catch (err) {
    console.error("Add user to project error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// OPTIONAL: Get members of a project
export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const members = await getProjectMembersService(projectId);

    return res.json({
      success: true,
      members,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



export const getProjectsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const projects = await getProjectsForUserService(userId);

    return res.json({
      success: true,
      data: projects,
    });
  } catch (err) {
    console.error("Get projects for user error:", err);
    return res.status(500).json({ error: err.message });
  }
};