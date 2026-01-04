const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cardDB = require("../../models/Card");

router.post("/save/snippet", async (req, res) => {
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const key = token.split(" ")[1];
    const decode = jwt.verify(key, process.env.SECRET);
    const { _id } = decode.checkUser;
    const snippet = await cardDB.create({
      title: req.body.title,
      content: req.body.content,
      status: "draft",
      author: _id,
    });
    res.json({ data: snippet });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
