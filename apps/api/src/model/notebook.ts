import mongoose, { Schema } from "mongoose";

export type NotebookType = {
  title: string;
  content: string;
  version?: number;
  userId: string;
  isDeleted?: boolean;
  isFav?: boolean;
  isPinned?: boolean;
  isPublic?: boolean;
};

const notebookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isFav: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Notebook =
  (mongoose.models.Notebook as mongoose.Model<NotebookType>) ||
  mongoose.model<NotebookType>("Notebook", notebookSchema);
