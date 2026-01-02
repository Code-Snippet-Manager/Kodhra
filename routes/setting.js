const express = require("express");
const sRouter = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Settings = require("../models/settings");
const User = require("../models/User");
sRouter.get("/", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  const decode = jwt.verify(token, process.env.SECRET);
  const { userImage, userName, email, _id } = decode.checkUser;
  const userInfo = await User.findById(_id);
  const findUserSettings = await Settings.findOne({ user: _id });
  res.render("settings", {
    image: userImage,
    userInfo,
    settings:findUserSettings
  });
});

sRouter.post("/list", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token not provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const userId = decoded.checkUser._id;
    const incomingSettings = req.body;

    const allowedFields = [
      "uiMode",
      "defaultLanguage",
      "showSidebar",
      "autoSaveInterval",
      "themev2",
      "accentColorv2",
      "fontSize",
      "uiDensity",
      "sidebarLayout",
      "tabSize",
      "wordWrap",
      "lineNumbers",
      "syntaxStyle",
      "autoFormat",
      "cloudSync",
      "syncFrequency",
      "dataEncryption",
      "desktopNotifications",
      "snippetAlerts",
      "appLockPin",
      "sessionTimeout",
      "exportFormat",
      "autoExportSchedule",
      "appVersion",
    ];

    const filtered = {};
    for (const key in incomingSettings) {
      if (allowedFields.includes(key)) {
        filtered[key] = incomingSettings[key];
      }
    }

    const exists = await Settings.findOne({ userId });

    if (exists) {
      await Settings.updateOne({ userId }, { $set: filtered });
    } else {
      await Settings.create({ userId, ...filtered });
    }

    return res.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return res.status(500).json({
      success: false,
      message: "A server error occurred while saving settings",
    });
  }
});


sRouter.get("/list", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
  let decode = jwt.verify(token, process.env.SECRET);
  const userId = decode.checkUser._id;
  const settings = await Settings.findOne({ userId });
  res.json(settings);
})

module.exports = sRouter;
