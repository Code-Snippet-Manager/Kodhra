import express from "express";
import { authMiddleware } from "../middlewares/authentication.js";
import {
  createFolderController,
  deleteFolderController,
  getFolderChildrenFoldersController,
  getFoldersController,
  updateFolderController,
} from "../controllers/folder.js";
const folderRouter = express.Router();

folderRouter.use(authMiddleware);
folderRouter.post("/create-folder", createFolderController);
folderRouter.get("/get-folders", getFoldersController);
folderRouter.post("/update-folder/:id", updateFolderController);
folderRouter.post("/delete-folder/:id", deleteFolderController);
folderRouter.get("/folder-children/:id", getFolderChildrenFoldersController);

export { folderRouter };
