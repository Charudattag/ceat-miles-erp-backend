import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Product from "../model/product.js";

const SharedProductCollection = sequelize.define(
  "SharedProductCollection",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_ids: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const value = this.getDataValue("product_ids");
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue("product_ids", JSON.stringify(value));
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    tableName: "shared_product_collections",
  }
);

export default SharedProductCollection;
