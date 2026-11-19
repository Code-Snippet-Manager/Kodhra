import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { apiResponse } from "../lib/api-response.js";
import { FolderSchemaType } from "../model/folder.js";
import { createFolderService, getFoldersService } from "../services/folders.js";

export const createFolderController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const { ...rest }: FolderSchemaType = req.body;
    if (!req.body.name) return apiResponse(res, "Missing required fields", 400, "error");
    const createFolder = await createFolderService(userId, rest);
    apiResponse(res, "Folder created successfully", 201, "success", createFolder);
  } catch (error) {
    logger.error("Internal Server Error, Can't create folder");
    if (error instanceof Error) {
      apiResponse(res, error.message, 500, "error");
    }
  }
};

export const getFoldersController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const folders = await getFoldersService(userId);
    apiResponse(res, "Folders fetched successfully", 200, "success", folders);
  } catch (error) {
    logger.error("Internal Server Error, Can't fetch folders");
    if (error instanceof Error) {
      apiResponse(res, error.message, 500, "error");
    }
  }
};
