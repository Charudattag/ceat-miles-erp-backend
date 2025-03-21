import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../Controller/productController.js";
import { uploadFiles } from "../middleware/multer.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const productRouter = express.Router();

productRouter.post("/createProduct", authMiddleware, createProduct);
productRouter.get("/getAllProducts", getAllProducts);
productRouter.get("/getProductById/:id", getProductById);
productRouter.post("/updateProduct/:id", authMiddleware, updateProduct);
productRouter.post("/deleteProduct/:id", authMiddleware, deleteProduct);

export default productRouter;
