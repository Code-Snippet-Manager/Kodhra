const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendmail.module.js");
const { getIO } = require("./socket");
const sendNotification = require("../utils/sendNotification.module");
const activity = require("./activity.module");
const createActivity = require("./activity.module");
router.get("/", (req, res) => {
  res.clearCookie("token");
  res.render("login");
});

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(404).render("error", {
        error: "User Not Found Kindly Provide Correct Email And Try Again",
      });
    }

    const comparePass = await bcrypt.compare(password, checkUser.password);
    if (!comparePass) {
      return res.status(401).render("error", {
        error:
          "Password Not Match... Kindly Provide Correct Password And Try Again.",
      });
    }

    const token = jwt.sign({ checkUser }, process.env.SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await createActivity({
      title: "Logged In",
      author: checkUser._id,
      activity: "logged_in",
      entityType: "user",
      entityId: checkUser._id,
      status: "success",
    });
    
    sendNotification(
      "Login Success",
      "You have successfully logged in.",
      "/card/create",
      checkUser._id
    );
    res.redirect("/");
  } catch (error) {
    res.render("error", { error: "Something went wrong please try again" });
  }
});
router.get("/check", (req, res) => {
  res.json({ cookies: req.cookies });
});

module.exports = router;
