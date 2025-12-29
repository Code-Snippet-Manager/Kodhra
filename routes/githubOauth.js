const express = require("express");
const gitroute = express.Router();
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const axios = require("axios");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
dotenv.config();
gitroute.get("/", (req, res) => {
  const redirect_uri = "https://kodhra.codewithajoydas.live/auth/github/callback";
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&scope=user:email`
  );
});

gitroute.get("/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );
    const accessToken = tokenResponse.data.access_token;
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `token ${accessToken}` },
      }
    );
    const primaryEmail =
      emailResponse.data.find((e) => e.primary && e.verified)?.email || null;

    let checkUser = await User.findOne({ email: primaryEmail });
    const { name, id, avatar_url, login } = userResponse.data;
    if (!checkUser) {
      const newUser = await User.create({
        userName: primaryEmail.split("@")[0],
        providerId: id,
        goodName: name ?? login,
        userImage: avatar_url,
        provider: "github",
        email: primaryEmail,
      });
      let token = jwt.sign({ checkUser: newUser }, process.env.SECRET);
      res.cookie("token", token).redirect("/");
    } else {
      checkUser.userName = primaryEmail.split("@")[0];
      checkUser.providerId = id;
      checkUser.goodName = name ?? login;
      checkUser.userImage = avatar_url;
      checkUser.provider = "github";

      await checkUser.save();

      let token = jwt.sign({ checkUser }, process.env.SECRET);
      res.cookie("ab", accessToken);
      res.cookie("token", token).redirect("/");
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "GitHub login failed" });
  }
});

module.exports = gitroute;
