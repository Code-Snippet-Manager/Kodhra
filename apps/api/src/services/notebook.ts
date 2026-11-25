import { Notebook, NotebookType } from "../model/notebook.js";
export const saveNoteBookService = async (userId: string, notebook: NotebookType) => {
  const saveNotebook = await Notebook.create({
    ...notebook,
    userId,
  });
  return saveNotebook;
};
export const editNoteBookService = async (
  userId: string,
  notebookId: string,
  notebook: NotebookType,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId: _ignored, ...data } = notebook;
  const updatedNotebook = await Notebook.findOneAndUpdate(
    { userId, _id: notebookId },
    { $set: data },
    {
      new: true,
      runValidators: true,
    },
  );
  return updatedNotebook;
};
export const deleteNoteBookService = async (notebookId: string, userId: string) => {
  const deletedNotebook = await Notebook.findOneAndUpdate(
    { userId, _id: notebookId },
    {
      $set: {
        isDeleted: true,
      },
    },
  );
  return deletedNotebook;
};
export const getNoteBookService = async (userId: string) => {
  const notebooks = await Notebook.find({ userId, isDeleted: false });
  return notebooks;
};
export const getNotebookByIdService = async (userId: string, notebookId: string) => {
  const notebook = await Notebook.findOne({ userId, _id: notebookId });
  return notebook;
};

export const pinNotebookService = async (userId: string, notebookId: string) => {
  return await Notebook.findOneAndUpdate(
    { userId, _id: notebookId },
    [
      {
        $set: {
          isPinned: {
            $not: [{ $ifNull: ["$isPinned", false] }],
          },
        },
      },
    ],
    { new: true, updatePipeline: true },
  );
};
export const favNotebookService = async (userId: string, notebookId: string) => {
  const favNotebook = await Notebook.findOneAndUpdate(
    { userId, _id: notebookId },
    [
      {
        $set: {
          isFav: {
            $not: [{ $ifNull: ["$isFav", false] }],
          },
        },
      },
    ],
    { new: true, updatePipeline: true },
  );
  return favNotebook;
};
