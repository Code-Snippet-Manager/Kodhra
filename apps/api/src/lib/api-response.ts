import { Response } from "express";

export const apiResponse = (
  res: Response,
  msg: string,
  code: number,
  status: "success" | "error",
  data?: any,
) => {
  return res.status(code).json({
    status,
    message: msg,
    data: status === "success" ? data : null,
  });
};
