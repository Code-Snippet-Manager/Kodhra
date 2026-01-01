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
  const code = req.query.code;
  if (!code) return res.redirect("/login");

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
    if (!data.id_token) return res.redirect("/login");

    const payload = JSON.parse(
      Buffer.from(data.id_token.split(".")[1], "base64").toString()
    );

    const { sub, email, name, picture } = payload;
    const userName = email.split("@")[0];

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        userName,
        goodName: name,
        email,
        providerId: sub,
        userImage: picture,
        provider: "google",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
});


module.exports = googleAuthrouter;
