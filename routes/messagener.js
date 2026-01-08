const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.get("/:userId", async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { userImage, userName, _id } = decode.checkUser;
  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) return res.status(401).json({ error: "Unauthorized" });

  res.render("chat", {
    image: userImage,
    userName,
    userId: _id,
    targetUser,
  });
});

module.exports = router;
