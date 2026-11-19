import mongoose, { InferSchemaType } from "mongoose";

const snippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      lowercase: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
    version: {
      type: Number,
      default: 1,
      required:true
    },
    originalSnippetId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Snippet",
      default: null
    },
    isFavorite: {
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
export type SnippetType = InferSchemaType<typeof snippetSchema>;

export const Snippet =
  (mongoose.models.Snippet as mongoose.Model<SnippetType>) ||
  mongoose.model<SnippetType>("Snippet", snippetSchema);
