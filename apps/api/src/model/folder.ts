import mongoose, { Schema } from "mongoose";

export type FolderSchemaType = {
  name: string;
  description?: string;
  userId: string;
  cards?: string[];
  parentFolderId: string | null;
  color?: string;
  icon?: string;
  isPinned?: boolean;
  isDeleted?: boolean;
};

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: "Snippet",
        default: null,
        index: true,
      },
    ],
    parentFolderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
      index: true,
    },
    color: {
      type: String,
      default: "#64748b",
    },
    icon: {
      type: String,
      default: "folder",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
folderSchema.index({
  userId: 1,
  parentFolderId: 1,
  name: 1,
});
export const Folder = mongoose.model("Folder", folderSchema);
