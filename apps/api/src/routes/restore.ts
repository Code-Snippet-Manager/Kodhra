import express from "express"
import { getDeletedDataController } from "../controllers/restore.js";
const restoreRouter = express.Router();
restoreRouter.get("/get-deleted-data", getDeletedDataController);
export {restoreRouter};