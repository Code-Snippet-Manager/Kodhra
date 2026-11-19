import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { apiResponse } from "../lib/api-response.js";
import {
  deleteSnippetService,
  duplicateSnippetService,
  getAllSnippetsService,
  getSnippetService,
  saveSnippetService,
  updateSnippetService,
} from "../services/snippets.js";
type Snippet = {
  title: string;
  language: string;
  code: string;
  tags: string[];
  description: string;
  id?: string;
};
export const saveSnippetController = async (req: Request, res: Response) => {
  try {
    const author = res.locals.user.id;
    const { title, language, code, tags, description }: Snippet = req.body;
    if (!title || !language || !code || !tags || !description) {
      apiResponse(res, "Missing required fields", 400, "error");
    }
    const snippet = await saveSnippetService({
      title,
      language,
      code,
      tags,
      description,
      author,
      isDeleted: false,
      isFavorite: false,
      isPublic: false,
      isPinned: false,
    });
    apiResponse(res, "Snippet saved successfully", 201, "success", snippet);
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    apiResponse(res, "Failed to connect to MongoDB", 500, "error");
  }
};
export const updateSnippetController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const { title, language, code, tags, description, id }: Snippet = req.body;
    if (!title || !language || !code || !tags || !description || !id) {
      apiResponse(res, "Missing required fields", 400, "error");
    }
    const snippet = await updateSnippetService(id as string, userId, {
      title,
      language,
      code,
      tags,
      description,
    });
    apiResponse(res, "Snippet updated successfully", 201, "success", snippet);
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    apiResponse(res, "Failed to connect to MongoDB", 500, "error");
  }
};
export const getSnippetsController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const snippet_id = req.params.id;
    const snippets = await getSnippetService(snippet_id as string, userId);
    apiResponse(res, "Snippets fetched successfully", 200, "success", snippets);
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    apiResponse(res, "Failed to connect to MongoDB", 500, "error");
  }
};
export const getAllSnippetsController = async (_: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const snippets = await getAllSnippetsService(userId);
    apiResponse(res, "Snippets fetched successfully", 200, "success", snippets);
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    apiResponse(res, "Failed to connect to MongoDB", 500, "error");
  }
};
export const duplicateSnippetController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const snippet_id = req.params.id;
    const duplicateSnippet = await duplicateSnippetService(snippet_id as string, userId);
    apiResponse(res, "Snippet duplicated successfully", 200, "success", duplicateSnippet);
  } catch (error) {
    logger.error({ err: error }, "Internal Server Error");
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};
export const deleteSnippetController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const snippetId = req.params.id;
    const deleteSnippet = await deleteSnippetService(snippetId as string, userId);
    apiResponse(res, "Snippet deleted successfully", 200, "success", deleteSnippet);
  } catch (error) {
    logger.error("Error Deleting Snippet");
    if (error instanceof Error) {
      apiResponse(res, error.message, 500, "error");
    }
  }
};
