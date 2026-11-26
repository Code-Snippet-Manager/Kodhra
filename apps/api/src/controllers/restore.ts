import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { apiResponse } from "../lib/api-response.js";
import { deleteDataPermanentlyService, getDeletedDataService, restoreDataService } from "../services/restore.js";

export const getDeletedDataController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const getData = await getDeletedDataService(userId);
    apiResponse(res, "Deleted data fetched successfully", 200, "success", getData);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};

export const restoreDataControllerController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const type = req.query.type;
    const id = req.params.id;
    const restoreData = await restoreDataService(
      userId,
      type as "folder" | "snippet" | "notebook",
      id as string,
    );
    apiResponse(res, "Deleted data restored successfully", 200, "success", restoreData);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};

export const deleteDataPermanentlyController = async (req:Request, res:Response) => {
  try {
    const userId = res.locals.user.id;
    const type = req.query.type;
    const id = req.params.id;
    const deletedData = await deleteDataPermanentlyService(
      userId,
      type as "folder" | "snippet" | "notebook",
      id as string,
    );
    apiResponse(res, "Deleted data permannently deleted successfully", 200, "success", deletedData);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  } 
}