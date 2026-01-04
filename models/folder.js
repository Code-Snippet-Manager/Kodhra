const mongoose = require("mongoose");
const folderSchema = new mongoose.Schema({
  folderName: {
    type: String,
    required: true,
    trim: true,
    default: "My Folder",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
  ],
  path: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  ispinned: {
    type: Boolean,
    default: false,
  },
 
}, {
  timestamps: true
});

folderSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); 

  const Folder = mongoose.model("Folder");

  const baseName = this.folderName;
  const author = this.author;
  const parent = this.parent ?? null;

  const regex = new RegExp(`^${baseName}( \\(\\d+\\))?$`);

  const existingFolders = await Folder.find({
    folderName: { $regex: regex },
    author,
    parent,
  }).select("folderName");

  if (existingFolders.length === 0) {
    return next();
  }

  let max = 0;

  existingFolders.forEach((f) => {
    const match = f.folderName.match(/\((\d+)\)$/);
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  });

  this.folderName = `${baseName} (${max + 1})`;
  next();
});

module.exports = mongoose.model("Folder", folderSchema);
