import { getUserWorkHoursService } from "./taskTimeLogService.js";

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
