import mongoose from "mongoose";
import { Folder, FolderSchemaType } from "../model/folder.js";
import { Snippet } from "../model/snippet.js";
export const createFolderService = async (
  userId: mongoose.Types.ObjectId,
  props: FolderSchemaType,
) => {
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
    return getFolders;
  } catch (error) {
    throw error;
  }
};
type UpdateFolderProps = {
  name?: string;
  color?: string;
  parentFolderId?: string;
};
export const updateFolderService = async (
  folderId: string,
  userId: string,
  props: UpdateFolderProps,
) => {
  try {
    const updatedFolder = await Folder.updateOne(
      { userId, _id: folderId },
      {
        $set: {
          ...props,
        },
      },
    );
    return updatedFolder;
  } catch (error) {
    throw error;
  }
};
export const deleteFolderService = async (folderId: string, userId: string) => {
  const deletedFolder = await Folder.updateOne(
    { userId, _id: folderId },
    {
      $set: {
        isDeleted: true,
      },
    },
  );
  return deletedFolder;
};

export const getFolderChildrenFoldersService = async (userId: string, folderId: string) => {
  try {
    const getFolders = await Folder.find({
      userId,
      parentFolderId: folderId,
      isDeleted: false,
    }).sort({ createdAt: -1 });
    const getSnippets = await Snippet.find({ folder: folderId, author: userId, isDeleted: false });
    return { folders: getFolders, snippets: getSnippets };
  } catch (error) {
    throw error;
  }
};
