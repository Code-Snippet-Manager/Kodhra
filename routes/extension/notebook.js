const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const notebookDB = require("../../models/Notebook");

router.post("/save/notebook", async (req, res) => {
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const key = token.split(" ")[1];
    const decode = jwt.verify(key, process.env.SECRET);
    const { _id } = decode.checkUser;
    const notebook = await notebookDB.create({
      notebookName: req.body.title,
      content: req.body.content,
      author: _id,
    });
    res.json({ data: notebook });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
