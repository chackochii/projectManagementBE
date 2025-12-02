import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },

      name: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },

      email: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false,
        validate: {
          isEmail: true
        }
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [10, 15] // supports international numbers
        }
      },

      identification: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Aadhar, PAN, Passport etc"
      },

      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      password: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },

      role: {
        type: DataTypes.ENUM(
          "developer",
          "designer",
          "project_manager",
          "admin"
        ),
        defaultValue: "developer",
      },

      status: {
        type: DataTypes.ENUM("active", "suspended", "pending", "blocked"),
        defaultValue: "active",
      },
    },
    { 
      tableName: "users", 
      timestamps: true 
    }
  );

  User.associate = (db) => {};

  return User;
};
