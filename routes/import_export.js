const express = require("express");
const ioRouter = express.Router();
const jwt = require("jsonwebtoken");
const Card = require("../models/Card");
const User = require("../models/User");
const Folder = require("../models/folder");
const multer = require("multer");
const versionDB = require("../models/versioning");
const folder = require("../models/folder");
const { default: mongoose } = require("mongoose");
const storage = multer.memoryStorage();
const upload = multer({ storage });

ioRouter.get("/", (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const userEmail = decode.checkUser.email;
  const userName = decode.checkUser.userName;
  const userImage = decode.checkUser.userImage;
  const author = decode.checkUser._id ?? decode.checkUser.id;

  res.render("Import_export", {
    userEmail,
    userName,
    image: userImage,
    author,
  });
});

ioRouter.post("/", upload.single("file"), async (req, res) => {
  const { originalname, buffer } = req.file;
  const jsonData = JSON.parse(buffer.toString());
  const cards = [];

  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id, author } = decode.checkUser;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    for (const item of jsonData) {
      const { title, description, content, tags, category } = item;

      const card = await Card.create(
        [
          {
            title,
            description,
            content,
            tags,
            author: _id ?? author,
            category,
          },
        ],
        { session }
      );

      cards.push(card[0]._id);

      await versionDB.create(
        [
          {
            version: 1,
            content,
            author: _id ?? author,
            cardId: card[0]._id,
          },
        ],
        { session }
      );
    }

    const folderName = originalname.split(".")[0];

    const createdFolder = await folder.create(
      [
        {
          folderName,
          cards, 
          parent: null,
          author: _id ?? author,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "File uploaded successfully",
      folder: { name: folderName },
      totalCards: cards.length,
      folderId: createdFolder[0]._id,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);

    return res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = ioRouter;
