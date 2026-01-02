const express = require("express");
const ioRouter = express.Router();
const jwt = require("jsonwebtoken");
const Card = require("../models/Card");
const User = require("../models/User");
const Folder = require("../models/folder");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

ioRouter.get("/", (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const userEmail = decode.checkUser.email;
  const userName = decode.checkUser.userName;
  const userImage = decode.checkUser.userImage;
  const author = decode.checkUser._id;

  res.render("import_export", {
    userEmail,
    userName,
    image: userImage,
    author,
  });
});

ioRouter.post("/", upload.single("file"), async (req, res) => {
  const { originalname, buffer } = req.file;
  const jsonData = JSON.parse(buffer.toString());

  jsonData.forEach(async (item) => {
    const { title, description, content, tags, category } = item;
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    const { _id, author } = decode.checkUser;

    await Card.create({
      title,
      description,
      content,
      tags,
      author: _id ?? author,
      category,
    });
  });

  res.json({ message: "File uploaded successfully", data: jsonData });
});

module.exports = ioRouter;
