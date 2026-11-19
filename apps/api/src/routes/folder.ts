import express from "express";
import { authMiddleware } from "../middlewares/authentication.js";
import { createFolderController, getFoldersController } from "../controllers/folder.js";
const folderRouter = express.Router();

folderRouter.use(authMiddleware);
folderRouter.post("/create-folder", createFolderController);
folderRouter.get("/get-folders", getFoldersController);

export { folderRouter };
