const jwt = require("jsonwebtoken");
const express = require("express");
const dotenv = require("dotenv");
const Settings = require("../models/settings");
dotenv.config();

async function checkSettings(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");
    const decode = jwt.verify(token, process.env.SECRET);
    if (!decode) return res.redirect("/login");
    const id = decode.checkUser._id ?? decode.checkUser.id;
    const settings = await Settings.findOne({ userId: id });
    if (!settings) {
      await Settings.create({ userId: id });
    }
    next();
  } catch (error) {
    console.log(error);
  }
}

module.exports = checkSettings;
