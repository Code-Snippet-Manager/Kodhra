const express = require("express");
const googleAuthrouter = express.Router();
const querystring = require("querystring");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
dotenv.config();
googleAuthrouter.get("/", (req, res) => {
  const params = querystring.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: "https://kodhra.codewithajoydas.live/auth/google/callback",
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

googleAuthrouter.get("/callback", async (req, res) => {
  let code = req.query.code;
  if (!code) return res.redirect("/login");
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:
          "https://kodhra.codewithajoydas.live/auth/google/callback",
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();
    console.log(data);
    const base64Url = data.id_token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const userInfo = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
    const { sub, email, name, picture } = userInfo;
    console.log(userInfo);
    const userImg = await cloudinary.uploader.upload(picture);
    const user = await User.findOne({ email });
    const userName = user.email.split("@")[0];
    if (!user) {
      let newUser = await User.create({
        userName,
        goodName: name,
        email,
        providerId: sub,
        userImage: userImg.secure_url,
        provider: "google",
      });
      let token = jwt.sign({ checkUser: newUser }, process.env.SECRET);
      res.cookie("token", token).redirect("/");
      return;
    } else {
      await User.updateOne({
        userName,
        goodName: name,
        providerId: sub,
        userImage: userImg.secure_url,
        provider: "google",
      });
      let token = jwt.sign({ checkUser: user }, process.env.SECRET);
      res.cookie("token", token).redirect("/");
    }
  } catch (error) {
    res.json({ error });
  }
});

module.exports = googleAuthrouter;
