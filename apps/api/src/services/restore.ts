import { Folder } from "../model/folder.js";
import { Notebook } from "../model/notebook.js";
import { Snippet } from "../model/snippet.js";

export const getDeletedDataService = async (userId: string) => {
  const [deletedNotebooks, deletedSnippets, deletedFolders] = await Promise.all([
    Notebook.find({
      userId,
      isDeleted: true,
    }),

    Snippet.find({
      author: userId,
      isDeleted: true,
    }),

    Folder.find({
      userId,
      isDeleted: true,
    }),
  ]);

  return {
    deletedNotebooks,
    deletedSnippets,
    deletedFolders,
  };
};
