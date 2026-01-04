const express = require("express");
const accesskeyRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
accesskeyRouter.post("/accesskey", async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id } = decode.checkUser;
  try {
    const checkUser = await User.findOne({ _id });
    if (!checkUser) {
      return res.status(404).render("error", {
        error: "User Not Found Kindly Provide Correct Email And Try Again",
      });
    }
    const accesskey = crypto.randomBytes(64).toString("hex");
    checkUser.accesskey = await bcrypt.hash(accesskey, 10);
    await checkUser.save();
    res.json({ accesskey_token: accesskey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error, Please try again" });
  }
});
accesskeyRouter.post("/verify", async (req, res) => {
  const { accesskey } = req.body;
  if (!accesskey)
    return res.status(400).json({ error: "Access Key is required" });
  try {
    const findUsers = await User.find({ accesskey: { $ne: null } }).select(
      "_id accesskey email userName userImage"
    );

    let matchedUser = null;

    for (let user of findUsers) {
      const isMatch = await bcrypt.compare(accesskey, user.accesskey);
      if (isMatch) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(404).json({ error: "Access Key Not Found" });
    }
    const token = jwt.sign({ checkUser: matchedUser }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        _id: matchedUser._id,
        userName: matchedUser.userName,
        email: matchedUser.email,
        userImage: matchedUser.userImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error, Please try again" });
  }
});

module.exports = accesskeyRouter;
