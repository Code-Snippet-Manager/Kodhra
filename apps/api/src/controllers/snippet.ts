import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { apiResponse } from "../lib/api-response.js";
import {
  deleteSnippetService,
  duplicateSnippetService,
  getAllSnippetsService,
  getSnippetService,
  getSnippetVersionsService,
  saveSnippetService,
  searchSnippetService,
  updateSnippetService,
} from "../services/snippets.js";
import mongoose from "mongoose";
type Snippet = {
  title: string;
  language: string;
  code: string;
  tags: string[];
  description: string;
  id?: string;
  folder?: mongoose.Types.ObjectId | null;
  visibility?: string;
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
    const { id, ...data }: Snippet = req.body;
    if (!id || Object.keys(data).length === 0) {
      return apiResponse(res, "Missing required fields", 400, "error");
    }
    const snippet = await updateSnippetService(id as string, userId, { ...data });
    return apiResponse(res, "Snippet updated successfully", 200, "success", snippet);
  } catch (error) {
    logger.error({ err: error }, "Failed to update snippet");
    if (res.headersSent) return;
    return apiResponse(res, "Failed to update snippet", 500, "error");
  }
};
export const getSnippetsController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const snippet_id = req.params.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const snippets = await getSnippetService(snippet_id as string, userId, page, limit);
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
export const searchSnippetController = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    logger.info(`query: ${search}`);
    const userId = res.locals.user.id;
    const getSnippets = await searchSnippetService(search as string, userId);
    apiResponse(res, "Snippets Fetched Successfully", 200, "success", getSnippets);
  } catch (error) {
    logger.error(`Internal Server Error ${error}`);
    res.json("sometuhg");
  }
};

export const getSnippetVersionsController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const snippetId = req.params.id;
    const versions = await getSnippetVersionsService(snippetId as string, userId);
    apiResponse(res, "Snippet Versions Fetched Successfully", 200, "success", versions);
  } catch (error) {
    apiResponse(res, "Internal Server Error", 500, "error");
    logger.error(`Internal Server Error ${error}`);
  }
};
