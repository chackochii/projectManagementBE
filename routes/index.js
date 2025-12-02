import { Router } from "express";

import {userRoutes}  from "./userRoutes.js";
import  leaveRoutes  from "./leavesRoutes.js";
import taskRoutes from "./taskRoutes.js";
import projectRoutes from "./projectRoutes.js";
import projectMemberRoutes from "./projectMemberRoutes.js";
import taskTimeLogRoutes from "./taskTimeLogRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

router.use("/users", userRoutes());
router.use("/leaves", leaveRoutes);
router.use("/tasks", taskRoutes);
router.use("/projects",  projectRoutes);
router.use("/project-members",  projectMemberRoutes);
router.use("/task-time", taskTimeLogRoutes);

export default router;
