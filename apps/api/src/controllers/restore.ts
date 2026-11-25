import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { apiResponse } from "../lib/api-response.js";
import { getDeletedDataService } from "../services/restore.js";

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
