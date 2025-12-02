import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Task = sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "backlog",
          "todo",
          "in-progress",
          "review",
          "done"
        ),
        defaultValue: "backlog",
      },

      priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        defaultValue: "medium",
      },

      assigneeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      reporterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      hoursTaken: {
              type: DataTypes.FLOAT, // store as hours (ex: 1.5)
              defaultValue: 0,
      },

      sprintId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // 🔥 NEW FIELD FOR PROJECT
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "tasks",
      timestamps: true,
    }
  );

  // 🔥 All associations here (NO db outside)
  Task.associate = (db) => {
    // Task.assigneeId → User.id
    Task.belongsTo(db.User, {
      foreignKey: "assigneeId",
      as: "assignee",
    });

    // Task.reporterId → User.id
    Task.belongsTo(db.User, {
      foreignKey: "reporterId",
      as: "reporter",
    });

    // Task.projectId → Project.id
    Task.belongsTo(db.Project, {
      foreignKey: "projectId",
      as: "project",
    });

    Task.hasMany(db.TaskTimeLog, {
      foreignKey: "taskId",
      as: "timeLogs",
    });
  };

  return Task;
};
