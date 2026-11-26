import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { apiResponse } from "../lib/api-response.js";
import { FolderSchemaType } from "../model/folder.js";
import {
  createFolderService,
  deleteFolderService,
  getFolderChildrenFoldersService,
  getFoldersService,
  updateFolderService,
} from "../services/folders.js";

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

export const updateFolderController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const id = req.params.id;
    const { name, parentFolderId, color }: FolderSchemaType = req.body;
    if (!id) {
      apiResponse(res, "Invalid folder id", 400, "error");
    }
    if (name && parentFolderId && color) {
      const folder = await updateFolderService(id as string, userId, {
        name,
        parentFolderId,
        color,
      });
      apiResponse(res, "Folder updated successfully", 200, "success", folder);
    } else if (name && !parentFolderId && !color) {
      const folder = await updateFolderService(id as string, userId, { name });
      apiResponse(res, "Folder updated successfully", 200, "success", folder);
    } else if (parentFolderId && !name && !color) {
      const folder = await updateFolderService(id as string, userId, { parentFolderId });
      apiResponse(res, "Folder updated successfully", 200, "success", folder);
    } else if (color && !name && !parentFolderId) {
      const folder = await updateFolderService(id as string, userId, { color });
      apiResponse(res, "Folder updated successfully", 200, "success", folder);
    }
  } catch (error) {
    logger.error(`Internal server error ${error}`);
    if (error instanceof Error) {
      apiResponse(res, error.message, 500, "error");
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};

export const deleteFolderController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const folderId = req.params.id;
    const deletedFolder = await deleteFolderService(folderId as string, userId);
    apiResponse(res, "Folder deleted successfully", 200, "success", deletedFolder);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};

export const getFolderChildrenFoldersController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const folderId = req.params.id;
    const folders = await getFolderChildrenFoldersService(userId, folderId as string);
    apiResponse(res, "Folders fetched successfully", 200, "success", folders);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};
