import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const Product = sequelize.define(
  "Products",
  {
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    gst_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    minimum_order_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    available_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
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
    tableName: "Products",
  }
);

export default Product;
