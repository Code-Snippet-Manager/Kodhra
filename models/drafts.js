const mongoose = require("mongoose");
const DraftSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
    description: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    trim: true,
    },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  category: {
    type: String,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    default: "draft",
  }
}, { timestamps: true });

module.exports = mongoose.model("Draft", DraftSchema);
