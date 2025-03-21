import express from "express";
import {
  createSharedProductCollection,
  getSharedProducts,
} from "../Controller/sharedcollectionController.js";
import { uploadFiles } from "../middleware/multer.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const SharedProductCollectionRouter = express.Router();

SharedProductCollectionRouter.post(
  "/createSharedProductCollection",
  authMiddleware,
  createSharedProductCollection
);
SharedProductCollectionRouter.post("/getSharedProducts", getSharedProducts);
// SharedProductCollectionRouter.get("/getProductById/:id", getProductById);
// SharedProductCollectionRouter.post("/updateProduct/:id", authMiddleware, updateProduct);
// SharedProductCollectionRouter.post("/deleteProduct/:id", authMiddleware, deleteProduct);

export default SharedProductCollectionRouter;
