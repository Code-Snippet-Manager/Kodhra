import express from "express";
import { authMiddleware } from "../middlewares/authentication.js";
import {
  deleteSnippetController,
  duplicateSnippetController,
  getAllSnippetsController,
  getSnippetsController,
  saveSnippetController,
  searchSnippetController,
  updateSnippetController,
} from "../controllers/snippet.js";
const snippetRouter = express.Router();
snippetRouter.use(authMiddleware);
snippetRouter.post("/create-snippet", saveSnippetController);
snippetRouter.post("/update-snippet", updateSnippetController);
snippetRouter.get("/get-snippets", getAllSnippetsController);
snippetRouter.get("/get-snippet/:id", getSnippetsController);
snippetRouter.post("/duplicate-snippet/:id", duplicateSnippetController);
snippetRouter.post("/delete-snippet/:id", deleteSnippetController);
snippetRouter.get("/search-snippet", searchSnippetController);

export { snippetRouter };
