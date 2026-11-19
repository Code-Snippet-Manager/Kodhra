import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectMongooseDB } from "./config/db.js";
import { env } from "./config/env.js";
import { auth } from "./lib/auth.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundMiddleware } from "./middlewares/not-found.js";
import { snippetRouter } from "./routes/snippet.js";
import { folderRouter } from "./routes/folder.js";
import { reportRouter } from "./routes/reports.js";
export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: [env.CORS_ORIGIN, "http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: "1mb" }));
connectMongooseDB();
app.get("/", (_req, res) => {
  res.json({
    name: "CWAD Fullstack API",
    version: "1.0.0",
    status: "running",
  });
});
app.all("/api/auth/{*path}", toNodeHandler(auth));

// bussiness routes
app.use("/api", snippetRouter);
app.use("/api", folderRouter);
app.use("/api", reportRouter);


app.use(notFoundMiddleware);
app.use(errorHandler);
