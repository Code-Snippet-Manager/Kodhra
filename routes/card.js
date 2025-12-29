const express = require("express");
const cardRouter = express.Router();
const cardSchema = require("../models/Card");
const jwt = require("jsonwebtoken");
const Card = require("../models/Card");
const Folder = require("../models/folder");
const mongoose = require("mongoose");
const findFavPinned = require("../utils/findFavPin.module");
const User = require("../models/User");
const createActivity = require("./activity.module");
const { getIO } = require("./socket");
const Settings = require("../models/settings");
const draftDB = require("../models/drafts");
cardRouter.get("/", async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id, userName, email, userImage } = decode.checkUser;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;
  const cards = await cardSchema
    .find({ author: _id, isDeleted: false })
    .populate("author", "userName userImage")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  let card = await findFavPinned(cards, _id);

  const len = await cardSchema
    .find({ author: _id, isDeleted: false })
    .countDocuments();
  const tags = await cardSchema.distinct("tags");
  const folders = await Folder.find({
    author: decode.checkUser._id,
    isDeleted: false,
  });

  res.render("allCards", {
    card,
    image: userImage,
    author: userName,
    userId: _id,
    len,
    folders,
    tags,
  });
});

cardRouter.get("/validation", async (req, res) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    const userId = decode.checkUser._id;

    const totalCount = await Card.countDocuments({
      author: userId,
      isDeleted: false,
    });

    const duplicates = await Card.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { content: "$content" },
          count: { $sum: 1 },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    const dupGroups = duplicates.length;

    const duplicatesToDelete = duplicates.reduce((sum, group) => {
      return sum + (group.count - 1);
    }, 0);

    const uniqueRemaining = totalCount - duplicatesToDelete;

    return res.json({
      totalCount,
      duplicateGroups: dupGroups,
      duplicatesToDelete,
      uniqueRemaining,
    });
  } catch (error) {
    console.error("Validation route error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

cardRouter.get("/create", async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);

  const { _id, userName, email, userImage } = decode.checkUser;
  const settings = await Settings.findOne({ userId: _id });
  res.render("newCard", {
    id: _id,
    name: userName,
    email,
    image: userImage,
    userId: _id,
    settings,
  });
});

cardRouter.get("/json", async (req, res) => {
  try {
    const token = req.cookies.token;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const id_user = req.query.id;
    const skip = (page - 1) * limit;
    const decode = jwt.verify(token, process.env.SECRET);
    const { _id, userName, userImage } = decode.checkUser;
    const { search } = req.query;
    let query = { author: id_user ?? _id };
    if (search) {
      query = {
        $or: [
          { isDeleted: false },
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
        author: _id,
      };
    }
    const cards = await cardSchema
      .find(query)
      .populate("author", "userName userImage")
      .skip(skip)
      .limit(limit);
    let card = await findFavPinned(cards, _id);
    res.render("partials/cards", {
      card,
      image: userImage,
      author: userName,
      userId: _id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

cardRouter.put("/restore/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Card ID" });
  }
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id, userName, userImage } = decode.checkUser;
  try {
    const card = await cardSchema.find({ _id });
    const editcard = await cardSchema.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );
    await createActivity({
      title: "Card Restored",
      author: editcard.author,
      activity: "restored",
      entityId: editcard._id,
      entityType: "snippet",
      status: "success",
    });
    res.json({ editcard });
  } catch (error) {
    try {
      await createActivity({
        title: "Card Restore Failed",
        author: req.user?._id || null,
        activity: "restored",
        entityType: "snippet",
        status: "failure",
      });
    } catch (logErr) {
      console.error("Activity log failed:", logErr);
    }
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

cardRouter.put("/pin/:id", async (req, res) => {
  try {
    const cardId = req.params.id;
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    const userId = decode.checkUser._id;
    const checkCard = await cardSchema.findOne({
      _id: cardId,
      isDeleted: false,
    });
    if (!checkCard) {
      return res.status(404).json({ error: "Card not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({ error: "Invalid Card ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPinned = user.pinnedCards.includes(cardId);

    if (isPinned) {
      user.pinnedCards.pull(cardId);
      await createActivity({
        title: "Card Unpinned",
        author: user._id,
        activity: "updated",
        entityId: cardId,
        entityType: "snippet",
        status: "success",
      });
    } else {
      user.pinnedCards.push(cardId);
      await createActivity({
        title: "Card Pinned",
        author: user._id,
        activity: "updated",
        entityId: cardId,
        entityType: "snippet",
        status: "success",
      });
    }

    await user.save();

    res.json({
      success: true,
      message: isPinned ? "unpinned" : "pinned",
      pinnedCards: user.pinnedCards,
    });
  } catch (err) {
    console.error("Error pinning card:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

cardRouter.put("/fav/:id", async (req, res) => {
  try {
    const cardId = req.params.id;
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    const userId = decode.checkUser._id;

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({ error: "Invalid Card ID" });
    }

    const checkCard = await cardSchema.findOne({
      _id: cardId,
      isDeleted: false,
    });
    if (!checkCard) {
      return res.status(404).json({ error: "Card not found" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isFavorite = user.favoriteCards.includes(cardId);

    if (isFavorite) {
      user.favoriteCards.pull(cardId); // remove
      await cardSchema.findByIdAndUpdate(
        cardId,
        { $pull: { likes: user._id } },
        { new: true }
      );
      await createActivity({
        title: "Card Unfavorited",
        author: user._id,
        activity: "updated",
        entityId: cardId,
        entityType: "snippet",
        status: "success",
      });
    } else {
      user.favoriteCards.push(cardId);
      await cardSchema.findByIdAndUpdate(
        cardId,
        { $push: { likes: user._id } },
        { new: true }
      );
      await createActivity({
        title: "Card Favorited",
        author: user._id,
        activity: "updated",
        entityId: cardId,
        entityType: "snippet",
        status: "success",
      });
    }

    await user.save();
    const likes = (await cardSchema.find({ _id: cardId }).populate("likes"))
      .length;
    res.json({
      success: true,
      message: `${isFavorite ? "unfavorited" : "favorited"}`,
      favoriteCards: user.favoriteCards,
      likes: likes,
    });
  } catch (err) {
    console.error("Error favoriting card:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

cardRouter.post("/delete", (req, res) => {
  const getData = req.body.selected;
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id } = decode.checkUser;
  try {
    cardSchema
      .updateMany(
        { author: _id, _id: { $in: getData } },
        { isDeleted: true },
        { new: true }
      )
      .then(() => {
        createActivity({
          title: "Card Deleted",
          author: req.body.author,
          activity: "deleted",
          entityId: getData,
          entityType: "snippet",
          status: "success",
        });
        res.json({ message: "Card deleted successfully" });
      });
  } catch (err) {
    res.json({ Error: "Something went wrong" });
  }
});

cardRouter.post("/download", async (req, res) => {
  try {
    const { query, language, startDate, endDate, selected } = req.body;

    if (Array.isArray(selected) && selected.length > 0) {
      const cards = await Card.find({ _id: { $in: selected } });
      return res.json(cards);
    }

    const filter = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ];
    }

    if (language) {
      filter.language = language;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      };
    }

    const cards = (await Card.find(filter)).map((card) => ({
      title: card.title,
      description: card.description,
      content: card.content,
      language: card.category,
      createdAt: card.createdAt,
    }));
    return res.json({
      cards,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to download cards" });
  }
});

cardRouter.get("/view/:id", async (req, res) => {
  const { id } = req.params;
  let userId = null;
  let userImage = "";
  let userName = "";
  try {
    const token = req.cookies?.token;
    if (token) {
      const decode = jwt.verify(token, process.env.SECRET);
      userId = decode?.checkUser?._id || null;
      userImage = decode?.checkUser?.userImage || "";
      userName = decode?.checkUser?.userName || "";
    }
  } catch (err) {}
  let card = null;
  card = await cardSchema
    .findOne({ _id: id, isDeleted: false })
    .populate("author", "userName userImage");
  if (!card) {
    card = await draftDB
      .findOne({ _id: id })
      .populate("author", "userName userImage");
  }
  if (!card) {
    return res.status(404).render("404", {
      message: "Card not found",
      userId,
      userName,
      image: userImage,
    });
  }
  res.render("editCard", {
    id,
    card,
    image: userImage || "",
    userName: userName || "",
    userId,
  });
});

cardRouter.post("/:id", async (req, res) => {
  const {
    title,
    description,
    content,
    tags,
    category,
    status,
    folderName,
    visibility,
    readmefile,
  } = req.body;
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    const { _id } = decode.checkUser;
    if (!_id) return res.status(401).json({ error: "Unauthorized" });
    const createCard = await Card.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        content,
        tags,
        category,
        visibility,
        readmefile,
        status,
        author: new mongoose.Types.ObjectId(_id),
      },
      { new: true }
    );
    await createActivity({
      title: "Card Updated",
      author: _id,
      activity: "created",
      entityType: "snippet",
      entityId: req.params.id,
      status: "success",
    });
    if (!createCard) {
      try {
        const session = await mongoose.startSession();
        session.startTransaction();
        const deleteDarft = await draftDB.findOneAndDelete({
          _id: req.params.id,
        }, { session });

        const createCard = await Card.create([{
          title,
          description,
          content,
          tags,
          category,
          visibility,
          readmefile,
          status,
          author: new mongoose.Types.ObjectId(_id),
        }], { session });

        await session.commitTransaction();
        if (!deleteDarft) {
          return res.status(404).json({ error: "Card not found" });
        }
      } catch (error) {
        await session.abortTransaction();
      }
    }

    try {
      const findFolder = await Folder.findOne({
        author: _id,
        folderName: folderName,
      });
      if (!findFolder) {
        const newFolder = await Folder.create({
          author: _id,
          folderName,
          cards: [createCard._id],
        });
      } else {
        findFolder.cards.push(createCard._id);
        await findFolder.save();
      }
    } catch (error) {
      return res.json({ error });
    }
    res.json({ createCard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Server error ${err.message}` });
  }
});

cardRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const token = req.cookies.token;
  if (!token) {
    return res.redirect(`/public/${id}`);
  }

  let decode;
  try {
    decode = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    return res.redirect(`/public/${id}`);
  }

  const { _id, userImage, userName } = decode.checkUser;

  const cards = await cardSchema
    .find({ _id: id, isDeleted: false })
    .populate("author", "userName userImage");

  if (cards.length === 0) {
    const drafts = await draftDB
      .find({ _id: id })
      .populate("author", "userName userImage");
    if (drafts.length > 0) {
      return res.render("error", {
        error:
          "Card is Not Published Yet it's Draft, Wait until it is published.",
      });
    }
    return res.status(404).send("Card not found");
  }

  const cardss = await findFavPinned(cards, _id);

  const folders = await Folder.find({
    author: _id,
    isDeleted: false,
  });

  res.render("viewcard", {
    card: cardss[0],
    image: userImage,
    author: userName,
    userId: _id,
    folders,
  });
});

module.exports = cardRouter;
