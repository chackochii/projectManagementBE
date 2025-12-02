import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ProjectMember = sequelize.define(
    "ProjectMember",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      projectId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      role: { type: DataTypes.STRING, defaultValue: "member" },
    },
    {
      tableName: "project_members",
      timestamps: true,
    }
  );

  ProjectMember.associate = (db) => {
    // key point: alias must match the one you use in queries
    db.ProjectMember.belongsTo(db.User, { as: "user", foreignKey: "userId" });
    db.User.hasMany(db.ProjectMember, { as: "projectMembers", foreignKey: "userId" });
    db.ProjectMember.belongsTo(db.Project, { as: "project", foreignKey: "projectId" });
    db.Project.hasMany(db.ProjectMember, { as: "members", foreignKey: "projectId" });

  };

  return ProjectMember;
};
