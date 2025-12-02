import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Leave = sequelize.define(
    "Leave",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      leaveType: {
        type: DataTypes.ENUM("SICK", "CASUAL", "EARNED", "UNPAID", "OTHER"),
        defaultValue: "OTHER",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        defaultValue: "PENDING",
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "leaves",
      timestamps: true
    }
  );

  return Leave;
};
