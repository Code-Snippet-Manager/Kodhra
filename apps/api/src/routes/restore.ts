import express from "express";
import {
  deleteDataPermanentlyController,
  getDeletedDataController,
  restoreDataControllerController,
} from "../controllers/restore.js";
const restoreRouter = express.Router();
restoreRouter.get("/get-deleted-data", getDeletedDataController);
restoreRouter.get("/restore-data/:id", restoreDataControllerController);
restoreRouter.get("/delete-permanently/:id", deleteDataPermanentlyController);
export { restoreRouter };
