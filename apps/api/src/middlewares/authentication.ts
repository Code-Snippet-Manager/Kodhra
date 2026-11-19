import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";
import { apiResponse } from "../lib/api-response.js";
import { auth } from "../lib/auth.js";
import { logger } from "../config/logger.js";

export const authMiddleware = async  (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      logger.error("Unauthorized");
      apiResponse(res, "Unauthorized", 401, "error");
    }
    res.locals.user = session?.user;
    res.locals.session = session?.session;
    next();
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    apiResponse(res, "Failed to connect to MongoDB", 500, "error");
  }
};
