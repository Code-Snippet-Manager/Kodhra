const express = require("express");
const deleteRouter = express.Router();
const cards = require("../models/Card.js");
const user = require("../models/User.js");
const jwt = require("jsonwebtoken");
const Folder = require("../models/folder.js");
const Card = require("../models/Card.js");
const createActivity = require("./activity.module.js");
const User = require("../models/User.js");
const { default: mongoose } = require("mongoose");
const Notebook = require("../models/Notebook.js");
const draftDB = require("../models/drafts");
deleteRouter.delete("/folder/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const userId = decode.checkUser._id;
  const folder = await Folder.findByIdAndUpdate(
    { _id: id, author: userId },
    { $set: { isDeleted: true } },
    { new: true }
  );
  await createActivity({
    title: "Folder Deleted",
    author: folder.author,
    activity: "deleted",
    entityId: folder._id,
    entityType: "folder",
    status: "success",
  });
  res.json({ data: folder });
});
deleteRouter.delete("/card/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const userId = decode.checkUser._id;
  const folder = await Card.findByIdAndUpdate(
    { _id: id, author: userId },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!folder) {
    const deleteDraft = await draftDB.findOneAndDelete({
      author: userId,
      _id: id,
    });
    return res.json({ data: deleteDraft });
  }
  await User.findOneAndUpdate(
    { _id: folder.author },
    { $pull: { favoriteCards: folder._id, pinnedCards: folder._id } }
  );
  await createActivity({
    title: "Card Deleted",
    author: folder.author,
    activity: "deleted",
    entityId: folder._id,
    entityType: "snippet",
    status: "success",
  });
  res.json({ data: folder });
});
deleteRouter.delete("/notebook/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const userId = decode.checkUser._id;
  const notebook = await Notebook.findByIdAndUpdate(
    { _id: id, author: userId },
    { $set: { isDeleted: true } },
    { new: true }
  );
  await createActivity({
    title: "Notebook Deleted",
    author: notebook.author,
    activity: "deleted",
    entityId: notebook._id,
    entityType: "other",
    status: "success",
  });
  res.json({ data: notebook });
});

deleteRouter.delete("/link/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const userId = decode.checkUser._id;
  const link = await user.findByIdAndUpdate(
    userId,
    {
      $pull: { links: { _id: id } },
    },
    { new: true }
  );
  await createActivity({
    title: "Card Deleted",
    activity: "deleted",
    author: userId,
    entityType: "snippet",
    status: "success",
  });
  res.json({ data: link });
});

deleteRouter.get("/duplicates", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const decode = jwt.verify(token, process.env.SECRET);
  const userId = decode.checkUser._id;

  try {
    const findDuplicates = await Card.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { content: "$content", author: "$author" },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    const kept = [];

    for (const duplicate of findDuplicates) {
      const ids = duplicate.ids;

      ids.sort((a, b) => b.getTimestamp() - a.getTimestamp()); // newest first
      const keep = ids[0];
      const remove = ids.slice(1);

      await Card.deleteMany({ _id: { $in: remove } });

      kept.push(keep);
    }

    await createActivity({
      title: "Deleted Duplicates",
      author: userId,
      activity: "deleted",
      status: "success",
      entityType: "snippet",
    });

    return res.json({
      status: 200,
      message: "Duplicates deleted successfully",
      duplicates: findDuplicates,
      kept,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = deleteRouter;
