import express from "express";
import { getDailyWiseReportController, getReportController } from "../controllers/reports.js";
import { authMiddleware } from "../middlewares/authentication.js";
const reportRouter = express.Router();

reportRouter.use(authMiddleware);
reportRouter.get("/get-report", getReportController);
reportRouter.get("/get-daily-wise-report", getDailyWiseReportController);

export { reportRouter };
