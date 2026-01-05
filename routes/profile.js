const express = require("express");
const profileRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");
const Card = require("../models/Card");
const getIO = require("./socket");
const findFavPinned = require("../utils/findFavPin.module");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.config");
const sendNotification = require("../utils/sendNotification.module");
const upload = multer({ dest: "uploads/" });
profileRouter.get("/:user", async (req, res) => {
  try {
    const token = req.cookies.token;
    const USER_NAME = req.params.user;
    const decode = jwt.verify(token, process.env.SECRET);
    const { _id, userName, email, userImage } = decode.checkUser;
    const user = await User.findOne({ userName: USER_NAME });
    const cardlen = await Card.find({ author: user._id }).countDocuments();
    const cards = await Card.find({ author: user._id, isDeleted: false })
      .populate("author")
      .sort({ likes: -1 })
      .limit(10);
    const card = await findFavPinned(cards, _id);
    if (!user) return res.json({ status: false, message: "User not found" });
    res.render("profile", {
      author: userName,
      image: userImage,
      userId: _id,
      user,
      cardlen,
      card,
    });
  } catch (error) {
    res.render("error", {
      error: "Something went wrong. Check the user id and try again.",
    });
  }
});
profileRouter.get("/", async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id, userName, email, userImage } = decode.checkUser;
  const user = await User.findById(_id);
  const cardlen = await Card.find({ author: user._id }).countDocuments();
  const cards = await Card.find({ author: user._id, isDeleted: false })
    .populate("author")
    .sort({ likes: -1 })
    .limit(10);
  const card = await findFavPinned(cards, user._id);
  res.render("profile", {
    author: userName,
    image: userImage,
    userId: _id,
    user,
    cardlen,
    card,
  });
});

profileRouter.post("/follow/:id", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    userId = decoded.checkUser._id;
  } catch (err) {
    return res.status(401).json({ status: false, message: "Invalid token" });
  }

  const targetUser = req.params.id;

  if (!mongoose.isValidObjectId(targetUser)) {
    return res.status(400).json({ status: false, message: "Invalid user ID" });
  }

  if (targetUser === userId) {
    return res.status(400).json({
      status: false,
      message: "You cannot follow yourself",
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const [target, user] = await Promise.all([
        User.findById(targetUser).session(session),
        User.findById(userId).session(session),
      ]);

      if (!target || !user) {
        throw new Error("User not found");
      }

      const isFollowing = target.followers.some((id) => id.equals(userId));

      if (!isFollowing) {
        await Promise.all([
          User.updateOne(
            { _id: targetUser },
            { $addToSet: { followers: userId } }
          ).session(session),

          User.updateOne(
            { _id: userId },
            { $addToSet: { following: targetUser } }
          ).session(session),
        ]);
        sendNotification(
          "New follower",
          `${user.userName} is now following you.`,
          `/profile/${user.userName}`,
          targetUser,
          user
        );
      } else {
        await Promise.all([
          User.updateOne(
            { _id: targetUser },
            { $pull: { followers: userId } }
          ).session(session),

          User.updateOne(
            { _id: userId },
            { $pull: { following: targetUser } }
          ).session(session),
        ]);
      }
    });

    return res.json({
      status: true,
      message: "OK",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
});

profileRouter.post("/block/:currentid/:targetid", async (req, res) => {
  try {
    const { currentid, targetid } = req.params;

    const user = await User.findById(currentid);
    const targetUser = await User.findById(targetid);

    if (!user || !targetUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    if (currentid === targetid) {
      return res.json({ status: false, message: "You cannot block yourself" });
    }
    const isBlocked = user.blockedUsers.includes(targetid);

    if (isBlocked) {
      user.blockedUsers = user.blockedUsers.filter(
        (id) => id.toString() !== targetid
      );
      await user.save();
      return res.json({ status: true, message: "unblocked" });
    } else {
      user.blockedUsers.push(targetid);
      await user.save();
      return res.json({ status: true, message: "blocked" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      error: "Server Error, try again later or contact support!",
    });
  }
});

const PLATFORM_MAP = {
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "github.com": "github",
  "gitlab.com": "gitlab",
  "bitbucket.org": "bitbucket",
  "linkedin.com": "linkedin",
  "instagram.com": "instagram",
  "facebook.com": "facebook",
  "twitter.com": "x",
  "x.com": "x",
  "tiktok.com": "tiktok",
  "dribbble.com": "dribbble",
  "behance.net": "behance",
  "medium.com": "medium",
  "reddit.com": "reddit",
  "stackoverflow.com": "stackoverflow",
  "hashnode.com": "hashnode",
  "dev.to": "devto",
  "codepen.io": "codepen",
  "codesandbox.io": "codesandbox",
  "discord.com": "discord",
  "telegram.me": "telegram",
  "t.me": "telegram",
  "whatsapp.com": "whatsapp",
  "snapchat.com": "snapchat",
  "pinterest.com": "pinterest",
  "fiverr.com": "fiverr",
  "upwork.com": "upwork",
  "kaggle.com": "kaggle",
  "leetcode.com": "leetcode",
  "codingame.com": "codingame",
  "replit.com": "replit",
  "vercel.com": "vercel",
  "netlify.app": "netlify",
  "npmjs.com": "npm",
  "devfolio.co": "devfolio",
  "producthunt.com": "producthunt",
  "buymeacoffee.com": "buymeacoffee",
};

function detectPlatform(url) {
  const domain = Object.keys(PLATFORM_MAP).find((key) => url.includes(key));
  return PLATFORM_MAP[domain] || "website";
}

profileRouter.post("/update", async (req, res) => {
  try {
    const { bio, address, isPrivate, userName, goodName } = req.body;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const decode = jwt.verify(token, process.env.SECRET);
    const userId = decode.checkUser._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Update bio
    if (bio !== undefined) {
      user.bio = bio;
    }

    // Update address
    if (address !== undefined) {
      user.address = address;
    }

    // Validate and update username
    if (userName !== undefined) {
      // Check if username belongs to someone else
      const usernameExists = await User.findOne({
        userName,
        _id: { $ne: userId }, // exclude current user
      });

      if (usernameExists) {
        return res.status(400).json({
          status: false,
          message: "Username already exists",
        });
      }

      user.userName = userName;
    }

    // Update goodName
    if (goodName !== undefined) {
      user.goodName = goodName;
    }

    // Update visibility
    if (isPrivate !== undefined) {
      user.visibility = isPrivate;
    }

    await user.save();

    return res.json({
      status: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, while updating profile",
    });
  }
});

profileRouter.post("/updateLinks", async (req, res) => {
  try {
    const { links } = req.body;
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({ status: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded.checkUser._id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    if (!Array.isArray(links))
      return res
        .status(400)
        .json({ status: false, message: "Invalid link format" });

    if (!Array.isArray(user.links)) user.links = [];

    links.forEach((url) => {
      if (!url || typeof url !== "string") return;

      const platform = detectPlatform(url);

      const index = user.links.findIndex((l) => l.platform === platform);

      if (index !== -1) {
        user.links[index].url = url;
      } else {
        if (user.links.length >= 4) {
          user.links.pop(); // remove last link
        }
        user.links.push({ platform, url });
      }
    });

    await user.save();

    res.json({ status: true, message: "Links updated", links: user.links });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

profileRouter.post(
  "/updateprofile",
  upload.single("profilePic"),
  async (req, res) => {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    if (!token)
      return res.status(401).json({ status: false, message: "Unauthorized" });
    const userId = decode.checkUser._id;
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });
    if (req.file) {
      const res = await cloudinary.uploader.upload(req.file.path);
      user.userImage = res.secure_url;
    }
    await user.save();
    res.json({ status: true, message: "Profile updated successfully" });
  }
);

module.exports = profileRouter;
