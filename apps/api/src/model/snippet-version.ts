
import mongoose, { Schema, Model } from "mongoose";

interface SnippetVersionType {
  snippetId: mongoose.Types.ObjectId;
  version: number;
  title?: string;
  description?: string;
  code: string;
  language: string;
  changeMessage: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const SnippetVersionSchema = new Schema<SnippetVersionType>(
  {
    snippetId: {
      type: Schema.Types.ObjectId,
      ref: "Snippet",
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    title: String,
    description: String,
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    changeMessage: {
      type: String,
      default: "Updated snippet",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

SnippetVersionSchema.index(
  { snippetId: 1, version: 1 },
  { unique: true }
);

export const SnippetVersion: Model<SnippetVersionType> =
  (mongoose.models.SnippetVersion as Model<SnippetVersionType>) ||
  mongoose.model<SnippetVersionType>(
    "SnippetVersion",
    SnippetVersionSchema
  );
