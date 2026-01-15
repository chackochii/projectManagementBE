import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Client = sequelize.define(
    "Client",
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
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive","deleted"),
        defaultValue: "active",
      },
    },
    {
      tableName: "clients",
      timestamps: true,
    }
  );

  Client.associate = (db) => {
  Client.hasMany(db.Project, {
    foreignKey: "clientId",
    as: "projects",
    onDelete: "CASCADE",
  });
};


  return Client;
};
