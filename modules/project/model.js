import { DataTypes } from "sequelize";


export default (sequelize) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      clientName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      clientEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },

      clientPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [10, 15],
        },
      },

      // project status
      status: {
        type: DataTypes.ENUM("active", "on-hold", "completed", "cancelled"),
        defaultValue: "active",
      },
    },
    {
      tableName: "projects",
      timestamps: true,
    }
  );

  // 🔥 ASSOCIATIONS (same pattern as your Task model)
  Project.associate = (db) => {
    // 1 project → many tasks
    Project.hasMany(db.Task, {
      foreignKey: "projectId",
      as: "tasks",
      onDelete: "CASCADE",
    });
  };

  return Project;
};
