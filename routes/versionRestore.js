const express = require("express");
const router = express.Router();
const Card = require("../models/Card");
const Version = require("../models/versioning");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

router.post("/restore/:versionId/:cardId", async (req, res) => {
  try {
    const { versionId, cardId } = req.params;
    console.log(versionId, cardId);

    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    const userId = decode.checkUser._id;

    const card = await Card.findOne({ _id: cardId, author: userId });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const version = await Version.findOne({
      version: versionId,
      cardId: card._id,
    });
    if (!version) {
      return res.status(404).json({ error: "Version not found" });
    }

    // Restore
    card.content = version.content;
    await card.save();

    const lastVersion = await Version.findOne({ cardId: card._id })
      .sort({ createdAt: -1 })

    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

    await Version.create({
      version: nextVersion,
      author: userId,
      cardId: card._id,
      content: card.content,
    });

    res.json({ success: true, message: "Version restored successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
