import { Folder } from "../model/folder.js";
import { Notebook } from "../model/notebook.js";
import { Snippet } from "../model/snippet.js";
export const getDeletedDataService = async (userId: string) => {
  const notebooks = await Notebook.find({ userId });
  const folders = await Folder.find({ userId });
  const snippets = await Snippet.find({ author: userId });
  return {
    deletedNotebooks: notebooks.filter((n) => n.isDeleted),
    deletedSnippets: snippets.filter((s) => s.isDeleted),
    deletedFolders: folders.filter((f) => f.isDeleted),
  };
};
export const restoreDataService = async (
  userId: string,
  type: "folder" | "snippet" | "notebook",
  id: string,
) => {
  if(type === "folder") {
    return await Folder.findOneAndUpdate({ userId, _id: id }, { $set: { isDeleted: false } });
  }
  if(type === "snippet") {
    return await Snippet.findOneAndUpdate({ author: userId, _id: id }, { $set: { isDeleted: false } });
  }
  if(type === "notebook") {
    return await Notebook.findOneAndUpdate({ userId, _id: id }, { $set: { isDeleted: false } });
  }
};
export const deleteDataPermanentlyService = async (
  userId: string,
  type: "folder" | "snippet" | "notebook",
  id: string,
) => {
  if(type === "folder") {
    return await Folder.findOneAndDelete({ userId, _id: id });
  }
  if(type === "snippet") {
    return await Snippet.findOneAndDelete({ author: userId, _id: id });
  }
  if(type === "notebook") {
    return await Notebook.findOneAndDelete({ userId, _id: id });
  }
};
