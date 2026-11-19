import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : "Internal server error";

  res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message,
  });
};