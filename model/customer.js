import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const Customer = sequelize.define(
  "Customers",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type_lead: {
      type: DataTypes.ENUM(
        "CUSTOMER",
        "IMPROGRESS LEAD",
        "ABENDEND LEAD",
        "FUTURE LEAD"
      ),
      defaultValue: "CUSTOMER",
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    update_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },

  {
    timestamps: true,
    tableName: "customer",
  }
);

export default Customer;
