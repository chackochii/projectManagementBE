import { getUserWorkHoursService, getProjectUserTaskHoursService } from "./taskTimeLogService.js";

export const getUserWorkHours = async (req, res) => {
  try {
    const { userId } = req.params;

    const totalHours = await getUserWorkHoursService(userId);

    return res.json({
      success: true,
      userId,
      date: new Date().toISOString().split("T")[0],
      totalHours: Number(totalHours.toFixed(2)),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getProjectUserTaskHours = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    console.log(projectId,userId,"------->")

    const report = await getProjectUserTaskHoursService(projectId, userId);

    return res.json({
      success: true,
      projectId,
      userId: userId || null,
      tasks: report,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

