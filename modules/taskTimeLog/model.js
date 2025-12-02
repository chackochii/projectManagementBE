import { DataTypes } from "sequelize";

export default (sequelize) => {
  const TaskTimeLog = sequelize.define(
    "TaskTimeLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      durationSeconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "task_time_logs",
      timestamps: true,
    }
  );

  // Associations
  TaskTimeLog.associate = (db) => {
    TaskTimeLog.belongsTo(db.Task, {
      foreignKey: "taskId",
      as: "task",
    });

    TaskTimeLog.belongsTo(db.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return TaskTimeLog;
};
