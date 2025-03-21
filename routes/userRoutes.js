import express from "express";
import { login, addUser, getAllVendors } from "../Controller/userController.js";
import { uploadFiles } from "../middleware/multer.js";

const UserRouter = express.Router();

UserRouter.post("/addUser", addUser);

UserRouter.post("/login", login);
UserRouter.get("/getAllVendors", getAllVendors);

export default UserRouter;
