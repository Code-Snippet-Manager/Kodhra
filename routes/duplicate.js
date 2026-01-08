const express = require("express");
const cardDB = require("../models/Card");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const duplicateRouter = express.Router();

duplicateRouter.post("/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decode = jwt.verify(token, process.env.SECRET);
    const userId = decode.checkUser._id;

    const card = await cardDB.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isAuthor = card.author.toString() === userId;

    const canDuplicate =
      card.status === "published" || (card.status !== "published" && isAuthor);

    if (!canDuplicate) {
      return res.status(403).json({
        error: "You are not allowed to duplicate this card",
      });
    }

    const duplicatedCard = await cardDB.create({
      title: card.title,
      description: card.description,
      content: card.content,
      tags: card.tags,
      category: card.category,
      author: new mongoose.Types.ObjectId(userId),

      readmefile: card.readmefile
        ? {
            title: card.readmefile.title,
            description: card.readmefile.description,
            content: card.readmefile.content,
          }
        : undefined,

      isDuplicate: true,
      duplicatedFrom: card._id,
      duplicatedAt: new Date(),
      status: "duplicate",
    });

    return res.json({
      success: true,
      data: duplicatedCard,
    });
  } catch (err) {
    console.error("Duplicate error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = duplicateRouter;
