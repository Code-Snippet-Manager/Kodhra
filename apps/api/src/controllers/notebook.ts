import { Request, Response } from "express";
import { apiResponse } from "../lib/api-response.js";
import { logger } from "../config/logger.js";
import { NotebookType } from "../model/notebook.js";
import {
  deleteNoteBookService,
  editNoteBookService,
  favNotebookService,
  getNotebookByIdService,
  getNoteBookService,
  pinNotebookService,
  saveNoteBookService,
} from "../services/notebook.js";
export const saveNotebookController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const { ...data }: NotebookType = req.body;
    const saveNotebook = await saveNoteBookService(userId, data);
    apiResponse(res, "Notebook saved successfully", 200, "success", saveNotebook);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};
export const editNotebookController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const notebookId = req.params.id;
    const notebook = req.body as NotebookType;
    const updatedNotebook = await editNoteBookService(userId, notebookId as string, notebook);
    if (!updatedNotebook) {
      return apiResponse(res, "Notebook not found", 404, "error");
    }
    return apiResponse(res, "Notebook updated successfully", 200, "success", updatedNotebook);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    return apiResponse(res, "Internal Server Error", 500, "error");
  }
};
export const getNotebookController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const getNotebooks = await getNoteBookService(userId);
    apiResponse(res, "Successfully Fetched Notebooks.", 200, "success", getNotebooks);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal server error", 500, "error");
  }
};
export const getNotebookByIdController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const notebookId = req.params.id;
    const getNotebook = await getNotebookByIdService(userId, notebookId as string);
    if (!getNotebook) {
      apiResponse(res, "No Notebook Found, Please Check The Url", 404, "error");
    }
    apiResponse(res, "Successfully Fetched Notebook", 200, "success", getNotebook);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};
export const deleteNotebookController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const notebookId = req.params.id;
    const deletedNotebook = await deleteNoteBookService(notebookId as string, userId);
    apiResponse(res, "Notebook deleted successfully", 200, "success", deletedNotebook);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};
export const pinNotebookController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const notebookId = req.params.id;
    const pinnedNotebook = await pinNotebookService(userId, notebookId as string);
    apiResponse(res, "Notebook Pinned Successfully", 200, "success", pinnedNotebook);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};
export const favNotebookController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const notebookId = req.params.id;
    const favNotebook = await favNotebookService(userId, notebookId as string);
    apiResponse(res, "Notebook Faved Successfully", 200, "success", favNotebook);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    apiResponse(res, "Internal Server Error", 500, "error");
  }
};
