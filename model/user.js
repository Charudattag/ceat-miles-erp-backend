import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "Users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,

      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("USER", "VENDOR"),
      defaultValue: "USER",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },

  {
    timestamps: true,
    tableName: "users",
  }
);

export default User;
