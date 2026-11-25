import mongoose from "mongoose";
import { Snippet } from "../model/snippet.js";
import { SnippetVersion } from "../model/snippet-version.js";
import userSchema from "../model/user.js";
import { Folder } from "../model/folder.js";
type CreateSnippetInput = {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  isFavorite: boolean;
  isPinned: boolean;
  isPublic: boolean;
  isDeleted: boolean;
  originalSnippetId?: mongoose.Types.ObjectId;
};
export type UpdateSnippetInput = {
  title?: string;
  description?: string;
  code?: string;
  language?: string;
  tags?: string[];
  folder?: mongoose.Types.ObjectId | null;
  isPublic?: boolean;
};
export const saveSnippetService = async (props: CreateSnippetInput) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const [snippet] = await Snippet.create([props], { session });
    await SnippetVersion.create(
      [
        {
          snippetId: snippet?._id as mongoose.Types.ObjectId,
          changeMessage: "Initial version",
          version: 1,
          language: props.language,
          code: props.code,
          title: props.title,
          description: props.description,
          createdBy: props.author.toString(),
        },
      ],
      { session },
    );
    await session.commitTransaction();
    await session.endSession();
    return snippet;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
};
export const deleteSnippetService = async (id: string, userId: string) => {
  try {
    const result = await Snippet.updateOne(
      { _id: id, author: userId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (result.matchedCount === 0) {
      throw new Error("Snippet not found.");
    }
    return result;
  } catch (error) {
    throw error;
  }
};
export const updateSnippetService = async (
  id: string,
  userId: string,
  props: UpdateSnippetInput,
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const snippet = await Snippet.findOne({
      _id: id,
      author: userId,
      isDeleted: false,
    }).session(session);
    if (!snippet) {
      throw new Error("Snippet not found.");
    }
    const lastVersion = await SnippetVersion.findOne({
      snippetId: snippet._id,
      isDeleted: false,
    })
      .sort({ version: -1 })
      .session(session);
    const updatedSnippet = await Snippet.findOneAndUpdate(
      {
        _id: id,
        author: userId,
        isDeleted: false,
      },
      {
        $set: { ...props, version: (lastVersion?.version ?? 0) + 1 },
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    );
    if (!updatedSnippet) {
      throw new Error("Snippet update failed.");
    }
    const [newVersion] = await SnippetVersion.create(
      [
        {
          snippetId: snippet._id,
          version: (lastVersion?.version ?? 0) + 1,
          title: updatedSnippet.title,
          description: updatedSnippet.description,
          code: updatedSnippet.code,
          language: updatedSnippet.language,
          createdBy: userId,
          changeMessage: "Snippet updated",
        },
      ],
      { session },
    );
    await session.commitTransaction();
    return {
      snippet: updatedSnippet,
      version: newVersion,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
export const getSnippetService = async (
  id: string,
  userId: string,
  page?: number,
  limit?: number,
) => {
  const __page = page || 1;
  const __limit = limit || 10;
  const offset = (__page - 1) * __limit;
  const snippet = await Snippet.findById({ _id: id, author: userId, isDeleted: false })
    .skip(offset)
    .limit(__limit)
    .sort({ createdAt: -1 });
  if (!snippet) {
    throw new Error("Snippet not found.");
  }
  return snippet;
};
export const getAllSnippetsService = async (userId: string) => {
  const User = Snippet.db.models.User || Snippet.db.model("User", userSchema, "user");
  const snippets = await Snippet.find({
    author: userId,
    isDeleted: false,
  })
    .populate({
      path: "author",
      model: User,
      select: "name email image",
    })
    .sort({ createdAt: -1 });
  return snippets;
};
export const duplicateSnippetService = async (id: string, userId: string) => {
  try {
    const snippet = await Snippet.findById(id);
    if (!snippet) {
      throw new Error("Snippet not found.");
    }
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      __v,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      ...snippetData
    } = snippet.toObject();
    const newSnippet = await saveSnippetService({
      ...snippetData,
      author: new mongoose.Types.ObjectId(userId),
      originalSnippetId: snippet._id,
    });
    return newSnippet;
  } catch (error) {
    throw error;
  }
};
export const searchSnippetService = async (query: string, userId: string) => {
  const search = query.trim();
  const result = await Snippet.aggregate([
    {
      $match: {
        author: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ],
      },
    },
    {
      $limit: 20,
    },
  ]);
  return result;
};
export const getSnippetVersionsService = async (id: string, userId: string) => {
  const snippet = await Snippet.findById({ _id: id, author: userId, isDeleted: false });
  if (!snippet) {
    throw new Error("Snippet not found.");
  }
  const versions = await SnippetVersion.find({
    snippetId: snippet._id,
    isDeleted: false,
  });
  return versions;
};
export type FilterSnippetType = {
  language: string | "all";
  searchText: string;
  tags: string;
  folder: string | "all";
  isFavorite: string | "all";
  isPinned: string | "all";
  isPublic: string | "all";
  isDeleted: string | "all";
  version: string;
};
export const filterSnippetService = async (
  userId: string,
  filter: FilterSnippetType,
  page: number,
  limit: number,
) => {
  const __page = Math.max(1, Number(page) || 1);
  const __limit = Math.min(100, Math.max(1, Number(limit) || 10));
  const offset = (__page - 1) * __limit;
  const matchQuery: Record<string, any> = {
    author: new mongoose.Types.ObjectId(userId),
  };
  if (filter.searchText?.trim()) {
    const searchText = filter.searchText.trim();
    const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    matchQuery.$or = [
      { title: { $regex: escapedText, $options: "i" } },
      { code: { $regex: escapedText, $options: "i" } },
      { description: { $regex: escapedText, $options: "i" } },
    ];
  }
  if (filter.language && filter.language !== "all") {
    matchQuery.language = filter.language;
  }
  if (filter.tags?.trim()) {
    const tags = filter.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tags.length > 0) {
      matchQuery.tags = { $in: tags };
    }
  }
  if (filter.folder && filter.folder !== "all") {
    if (filter.folder === "none") {
      matchQuery.$and = [
        ...(matchQuery.$and ?? []),
        {
          $or: [{ folder: null }, { folder: { $exists: false } }],
        },
      ];
    } else {
      if (!mongoose.Types.ObjectId.isValid(filter.folder)) {
        throw new Error("Invalid folder ID");
      }
      matchQuery.folder = new mongoose.Types.ObjectId(filter.folder);
    }
  }
  const booleanFields = ["isFavorite", "isPinned", "isPublic", "isDeleted"] as const;
  for (const field of booleanFields) {
    const value = filter[field];
    if (value === "true" || value === "false") {
      matchQuery[field] = value === "true";
    }
  }
  if (filter.version?.trim()) {
    const version = Number(filter.version);
    if (!Number.isInteger(version) || version < 1) {
      throw new Error("Invalid version");
    }
    matchQuery.version = version;
  }
  const snippets = await Snippet.aggregate([
    {
      $match: matchQuery,
    },
    {
      $sort: {
        updatedAt: -1,
        _id: -1,
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $skip: offset,
    },
    {
      $limit: __limit,
    },
  ]);
  return snippets;
};

export const moveSnippetService = async (userId: string, snippetId: string, folderId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const result = await Snippet.updateOne(
    { _id: snippetId, author: userId },
    { $set: { folder: folderId } },
  ).session(session);
  await Folder.updateOne({ userId, _id: folderId }, { $addToSet: { cards: snippetId } }).session(
    session,
  );
  await session.commitTransaction();
  await session.endSession();
  return result;
};
