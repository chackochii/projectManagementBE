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

      clientId: {
        type: DataTypes.INTEGER,
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
          len: [6, 15],
        },
      },

      status: {
        type: DataTypes.ENUM("active", "on-hold", "completed", "cancelled"),
        defaultValue: "active",
      },
    },
    {
      tableName: "projects",
      timestamps: true,
      paranoid: true,          // ✅ SOFT DELETE
      deletedAt: "deletedAt",  // explicit (optional but clear)
    }
  );

  Project.associate = (db) => {
    Project.hasMany(db.Task, {
      foreignKey: "projectId",
      as: "tasks",
    });

    Project.belongsTo(db.Client, {
      foreignKey: "clientId",
      as: "client",
    });
  };

  return Project;
};
