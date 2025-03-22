import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";
import Category from "./category.js";

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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
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
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
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
Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Product.belongsTo(User, {
  foreignKey: "vendor_id",
  as: "vendor",
});

export default Product;
