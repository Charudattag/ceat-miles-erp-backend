import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Product from "./product.js";
import User from "./user.js";

const Media = sequelize.define(
  "Media",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("IMAGE", "VIDEO", "PDF"),
      defaultValue: "IMAGE",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
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
    tableName: "media",
  }
);

export default Media;
