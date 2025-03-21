import express from "express";
import {
  addMedia,
  getAllMedia,
  updateMedia,
  deleteMedia,
  getMediaById,
} from "../Controller/mediaController.js";
import { uploadFiles } from "../middleware/multer.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const mediaRouter = express.Router();

mediaRouter.post("/addMedia", authMiddleware, uploadFiles, addMedia);
mediaRouter.get("/getAllMedia", getAllMedia);
mediaRouter.get("/getMediaById/:id", getMediaById);
mediaRouter.post("/updateMedia/:id", authMiddleware, updateMedia);
mediaRouter.post("/deleteMedia/:id", authMiddleware, deleteMedia);

export default mediaRouter;
