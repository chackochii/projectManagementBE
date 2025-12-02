import {
  createProjectService,
  listProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
} from "./project.service.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, clientName, clientEmail, clientPhone, status } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await createProjectService({
      name,
      description,
      clientName,
      clientEmail,
      clientPhone,
      status: status || "active",
    });

    res.status(201).json({
      message: "Project created successfully",
      data: project,
    });
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const listProjects = async (req, res) => {
  try {
    const projects = await listProjectsService();
    res.status(200).json({ data: projects });
  } catch (err) {
    console.error("List Projects Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await getProjectByIdService(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ data: project });
  } catch (err) {
    console.error("Get Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await updateProjectService(id, req.body);
    if (!updated) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({
      message: "Project updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Update Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteProjectService(id);
    if (!deleted) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


