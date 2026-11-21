import { Request, Response } from "express";
import { getDailyWiseReportService, getReportByLanguageService, getReportService } from "../services/reports.js";
import { apiResponse } from "../lib/api-response.js";
import { logger } from "../config/logger.js";

export const getReportController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const reports = await getReportService(userId);
    apiResponse(res, "Reports fetched successfully", 200, "success", reports);
  } catch (error) {
    logger.error("Internal Server Error, Can't fetch reports");
    if (error instanceof Error) {
      apiResponse(res, error.message, 500, "error");
    }
  }
};


export const getDailyWiseReportController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    logger.info(`start Date, ${startDate}, end date, ${endDate}`);
    const reports = await getDailyWiseReportService(userId, startDate, endDate);
    apiResponse(res, "Reports fetched successfully", 200, "success", reports);
  } catch (error) {
    logger.error("Internal Server Error, Can't fetch reports");
    if (error instanceof Error) {
      apiResponse(res, error.message, 500, "error");
    }
  }
};

export const getReportByLanguage = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const reports = await getReportByLanguageService(userId);
    apiResponse(res, "Reports fetched successfully", 200, "success", reports);
  } catch (error) {
    logger.error("Internal Server Error, Can't fetch reports");
    if (error instanceof Error) {
      apiResponse(res, error.message, 500, "error");
    }
  }
};