const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "My Snippet",
    },
    description: {
      type: String,
      trim: true,
      default: "No Description",
    },
    content: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      default: "Text",
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    visibility: { type: Boolean, default: true },
    metadata: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    likes: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
      },
    ],
    readmefile: {
      title: {
        type: String,
        trim: true,
        default: "My Snippet Readme",
      },
      description: {
        type: String,
        trim: true,
        default: "No Description",
      },
      content: {
        type: String,
        trim: true,
      },
    },
    status: {
      enum: ["draft", "published", "private", "archived"],
      type: String,
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);
cardSchema.index(
  {
    title: "text",
    description: "text",
    content: "text",
  },
  {
    weights: {
      title: 10,
      description: 5,
      content: 1,
    },
    name: "card_full_text_search",
  }
);

module.exports = mongoose.model("Card", cardSchema);
