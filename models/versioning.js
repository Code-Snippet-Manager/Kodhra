const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Version = mongoose.model("Version", versionSchema);
module.exports = Version;
