const express = require("express");
const draftRouter = express.Router();
const DraftDB = require("../models/drafts");
const jwt = require("jsonwebtoken");

draftRouter.post("/", async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  try {
    const { _id } = decode.checkUser;
    const draft = await DraftDB.create({ ...req.body, author: _id });
    res.json({ data: draft });
  } catch (error) {
    res.json({ error: error.message });
  }
});

draftRouter.post("/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id } = decode.checkUser;
  const updateDraft = await DraftDB.findOneAndUpdate(
    { _id: id, author: _id },
    { ...req.body },
    { new: true }
  );
  res.json({ data: updateDraft });
});

module.exports = draftRouter;
