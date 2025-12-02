import { Op } from "sequelize";
import {db} from "../../config/database.js";

export const getUserWorkHoursService = async (userId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch logs only for today
  const logs = await db.TaskTimeLog.findAll({
    where: {
      userId,
      startTime: { [Op.between]: [startOfDay, endOfDay] },
    },
  });

  const totalSeconds = logs.reduce(
    (acc, log) => acc + (log.durationSeconds || 0),
    0
  );

  return totalSeconds / 3600; // convert to hours
};

