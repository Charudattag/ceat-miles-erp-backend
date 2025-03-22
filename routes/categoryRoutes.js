import express from "express";
import {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../Controller/categoryController.js";
import { uploadFiles } from "../middleware/multer.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const categoryRouter = express.Router();

categoryRouter.post("/createCategory", addCategory);
categoryRouter.get("/getAllCategories", getAllCategories);
categoryRouter.get("/getCategoryById/:id", getCategoryById);
categoryRouter.post("/updateCategory/:id", authMiddleware, updateCategory);
categoryRouter.post("/deleteCategory/:id", authMiddleware, deleteCategory);

export default categoryRouter;
