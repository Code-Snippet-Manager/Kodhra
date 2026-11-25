import express from "express";
import {
  deleteNotebookController,
  editNotebookController,
  favNotebookController,
  getNotebookByIdController,
  getNotebookController,
  pinNotebookController,
  saveNotebookController,
} from "../controllers/notebook.js";
const notebookRouter = express.Router();

notebookRouter.post("/create-notebook", saveNotebookController);
notebookRouter.get("/get-notebook", getNotebookController);
notebookRouter.get("/get-notebook/:id", getNotebookByIdController);
notebookRouter.post("/update-notebook/:id", editNotebookController);
notebookRouter.post("/delete-notebook/:id", deleteNotebookController);
notebookRouter.post("/pin-notebook/:id", pinNotebookController);
notebookRouter.post("/fav-notebook/:id", favNotebookController);
export { notebookRouter };
