import mongoose from "mongoose";
import { Folder, FolderSchemaType } from "../model/folder.js";
export const createFolderService = async (userId: mongoose.Types.ObjectId, props: FolderSchemaType) => {
  try {
    const folder = await Folder.create({ ...props, userId });
    return folder;
  } catch (error) {
    throw error;
  }
};
export const getFoldersService = async (userId: string) => {
  try {
    const getFolders = await Folder.find({ userId }).sort({ createdAt: -1 });
    return getFolders
  } catch (error) {
    throw error
  }
}