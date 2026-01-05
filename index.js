/**
 * Express framework module.
 * @module express
 * @requires express
 * @type {import('express')}
 */
const express = require("express");
const app = express();
app.get("/favicon.ico", (req, res) => res.status(204).end());

const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
dotenv.config();
const fs = require("fs");
const paymentRouter = require("./routes/payments");
const router = require("./routes/authentication");
const profileRouter = require("./routes/profile");
const signup = require("./routes/authoraization");
const googleAuthrouter = require("./routes/googleAuth");
const gitroute = require("./routes/githubOauth");
const cardRouter = require("./routes/card");
const session = require("express-session");
const fpRouter = require("./routes/forgotPass.js");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const settingMiddleWare = require("./middleware/settings.middleware");

const RedisStore = require("connect-redis").RedisStore;
const client = require("./config/redis.config.js");
const path = require("path");
const cors = require("cors");
const Folder = require("./models/folder");
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.set("view engine", "ejs");
const User = require("./models/User");
const connectDB = require("./config/mongoose.config");
connectDB();
const authMiddleware = require("./middleware/auth.middleware");
const vRouter = require("./routes/verifyEmail");
const Card = require("./models/Card");
const shareLink = require("./utils/shareLink.module");
const folderRouter = require("./routes/folder");
const searchRouter = require("./routes/search");
const tagsRouter = require("./routes/tags");
const pinRouter = require("./routes/pin");
const ioRouter = require("./routes/import_export");
const favRouter = require("./routes/fav");
const sRouter = require("./routes/setting");
const moveRouter = require("./routes/move");
const deleteRouter = require("./routes/delete");
const imageRouter = require("./routes/getimage");
const os = require("os");
const http = require("http");
const server = http.createServer(app);
const socket = require("./routes/socket");
const notificationRouter = require("./routes/notification");
const sendNotification = require("./utils/sendNotification.module");
const shareRouter = require("./routes/share");
const languageRouter = require("./routes/languageWise");
const expoloreRouter = require("./routes/explore");
const activityRouter = require("./routes/activity");
const createActivity = require("./routes/activity.module");
const recyclebinRouter = require("./routes/recycle");
const findFavPinned = require("./utils/findFavPin.module");
const cdnRouter = require("./routes/create_cdn_links");
const { BSON } = require("bson");
const accesskeyRouter = require("./routes/generate_access_key");
const notebookRouter = require("./routes/notebook");
const downloadRouter = require("./routes/download");
const followuser = require("./routes/getuserstofollow");
const folder = require("./models/folder");
const Notebook = require("./models/Notebook");
const draftRouter = require("./routes/drafts");
const DraftDB = require("./models/drafts");
const Version = require("./models/versioning");
const versioningRouter = require("./routes/versionRestore");
const extNotebook = require("./routes/extension/notebook");
const extSnippet = require("./routes/extension/snippet");
app.get("/favicon.ico", (req, res) => res.status(204));
const io = socket.init(server);
io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    socket.join(userId);
    console.log("User connected:", userId);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use(express.json());
app.use(
  session({
    store: new RedisStore({ client }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 5 * 60 * 1000 },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use("/login", router);
app.use("/signup", signup);
app.use("/card", authMiddleware, settingMiddleWare, cardRouter);
app.use("/dlt", authMiddleware, settingMiddleWare, cardRouter);
app.use("/edit", authMiddleware, settingMiddleWare, cardRouter);
app.use("/forgotPass", fpRouter);
app.use("/auth/github/", gitroute);
app.use("/emailverification", vRouter);
app.use("/folder", authMiddleware, settingMiddleWare, folderRouter);
app.use("/search", authMiddleware, settingMiddleWare, searchRouter);
app.use("/tags", authMiddleware, settingMiddleWare, tagsRouter);
app.use("/pin", authMiddleware, settingMiddleWare, pinRouter);
app.use("/fav", authMiddleware, settingMiddleWare, favRouter);
app.use("/import-export", authMiddleware, settingMiddleWare, ioRouter);
app.use("/settings", authMiddleware, settingMiddleWare, sRouter);
app.use("/moveit", authMiddleware, settingMiddleWare, moveRouter);
app.use("/delete", authMiddleware, settingMiddleWare, deleteRouter);
app.use("/images", authMiddleware, settingMiddleWare, imageRouter);
app.use(
  "/notifications",
  authMiddleware,
  settingMiddleWare,
  notificationRouter
);
app.use("/profile", authMiddleware, settingMiddleWare, profileRouter);
app.use("/auth/google", googleAuthrouter);
app.use("/payment", authMiddleware, settingMiddleWare, paymentRouter);
app.use("/share", authMiddleware, settingMiddleWare, shareRouter);
app.use("/language", authMiddleware, settingMiddleWare, languageRouter);
app.use("/explore", authMiddleware, settingMiddleWare, expoloreRouter);
app.use("/activity", authMiddleware, settingMiddleWare, activityRouter);
app.use("/recyclebin", authMiddleware, settingMiddleWare, recyclebinRouter);
app.use("/generate_cdn", authMiddleware, settingMiddleWare, cdnRouter);
app.use("/token", authMiddleware, settingMiddleWare, accesskeyRouter);
app.use("/notebook", authMiddleware, settingMiddleWare, notebookRouter);
app.use("/folders", authMiddleware, settingMiddleWare, downloadRouter);
app.use("/f", authMiddleware, settingMiddleWare, followuser);
app.use("/drafts", authMiddleware, settingMiddleWare, draftRouter);
app.use("/version", authMiddleware, settingMiddleWare, versioningRouter);
app.use("/extionsion/", extNotebook);
app.use("/s/ex/", extSnippet);
app.get("/landing", (req, res) => {
  res.render("landingPage");
});

// HOME ROUTER
app.get("/", authMiddleware, async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    const folders = await Folder.find({
      author: decode.checkUser._id,
      isDeleted: false,
      parent: null,
    })
      .populate("author")
      .limit(5);
    const cards = await Card.find({
      author: decode.checkUser._id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("author", "userName userImage");
    const card = await findFavPinned(cards, decode.checkUser._id);
    const draftCount = await DraftDB.countDocuments({
      author: decode.checkUser._id,
    });
    res.render("index", {
      image: decode.checkUser?.userImage || decode.user?.avatar,
      card,
      draftCount,
      author: decode.checkUser.userName,
      userId: decode.checkUser._id,
      folders,
      app_url: process.env.APP_URL,
      appVersion,
    });
  } catch (err) {
    next(err);
  }
});

app.post("/card", async (req, res) => {
  const {
    title,
    description,
    content,
    tags,
    category,
    folderName,
    visibility,
    readmefile,
    draftId = null,
  } = req.body;

  const session = await mongoose.startSession();

  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    const { _id } = decode.checkUser;
    if (!_id) {
      session.endSession();
      return res.status(401).json({ error: "Unauthorized" });
    }

    session.startTransaction();

    const createdCards = await Card.create(
      [
        {
          title,
          description,
          content,
          tags,
          category,
          visibility,
          readmefile,
          author: new mongoose.Types.ObjectId(_id),
        },
      ],
      { session }
    );

    const card = createdCards[0];
    const version = await Version.create(
      [
        {
          version: "1.0",
          content: card.content,
          author: new mongoose.Types.ObjectId(_id),
          cardId: card._id,
        },
      ],
      { session }
    );

    if (draftId) {
      const deletedDraft = await DraftDB.findOneAndDelete(
        { _id: draftId, author: _id },
        { session }
      );
      if (!deletedDraft) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Draft not found" });
      }
    }

    await Folder.updateOne(
      { author: _id, folderName },
      { $addToSet: { cards: card._id } },
      { upsert: true, session }
    );

    await createActivity({
      title: "Card Created",
      author: _id,
      activity: "created",
      entityType: "snippet",
      entityId: card._id,
      status: "success",
    });

    await session.commitTransaction();
    session.endSession();

    return res.json({ createCard: card });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: `Server error ${err.message}` });
  }
});

app.get("/draft", authMiddleware, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id } = decode.checkUser;
  const findDrafts = await DraftDB.find({
    author: _id,
  }).populate("author");
  res.render("draft", {
    image: decode.checkUser?.userImage || decode.user?.avatar,
    author: decode.checkUser.userName,
    userId: decode.checkUser._id,
    app_url: process.env.APP_URL,
    appVersion,
    card: findDrafts,
  });
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    res.header("Content-Type", "application/xml");

    const baseUrl = "https://kodhra.codewithajoydas.live";

    const staticUrls = [
      "/",
      "/landing/features",
      "/landing",
      "/landing/workflow",
      "/explore",
      "/profile",
      "/card",
      "/search",
      "/folder",
      "/notbook/get",
    ];

    const snippets = await Card.find({
      isDeleted: false,
    }).select("_id");
    const folders = await folder
      .find({
        isDeleted: false,
      })
      .select("_id");
    const notebooks = await Notebook.find({
      isDeleted: false,
    }).select("_id");
    const users = await User.find({ visibility: "public" }).select("userName");

    let urls = [];

    staticUrls.forEach((path) => {
      urls.push(`
        <url>
          <loc>${baseUrl}${path}</loc>
          <priority>0.8</priority>
        </url>
      `);
    });

    snippets.forEach((s) => {
      urls.push(`
        <url>
          <loc>${baseUrl}/card/view/${s._id}</loc>
          <priority>0.7</priority>
        </url>
      `);
    });

    folders.forEach((f) => {
      urls.push(`
        <url>
          <loc>${baseUrl}/folder/${f._id}</loc>
          <priority>0.6</priority>
        </url>
      `);
    });

    notebooks.forEach((n) => {
      urls.push(`
        <url>
          <loc>${baseUrl}/notebook/view/${n._id}</loc>
          <priority>0.6</priority>
        </url>
      `);
    });

    users.forEach((u) => {
      urls.push(`
        <url>
          <loc>${baseUrl}/profile/${u.userName}</loc>
          <priority>0.5</priority>
        </url>
      `);
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls.join("")}
      </urlset>
    `;

    res.send(sitemap);
  } catch (err) {
    console.error("Sitemap error:", err);
    res.status(500).end();
  }
});

/*
Demo routes remove it before deployment
*/
app.get("/democards", async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const userEmail = decode.checkUser.email;
  const folders = await Folder.find({
    author: decode.checkUser._id,
    parent: null,
  });
  const card = await Card.find({ author: decode.checkUser._id })
    .sort({ createdAt: -1 })
    .limit(15);

  res.render("demo", {
    image: decode.checkUser?.userImage || decode.user?.avatar,
    card,
    author: decode.checkUser.userName,
    userId: decode.checkUser._id,
    folders,
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});
app.get("/report", authMiddleware, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id } = decode.checkUser;
  if (!_id) return res.status(401).json({ error: "Unauthorized" });
  const totalCards = await Card.countDocuments({
    author: _id,
    isDeleted: false,
  });
  const totalFolders = await Folder.countDocuments({
    author: _id,
    isDeleted: false,
  });
  const totalTags = (await Card.distinct("tags", { author: _id })).length;
  let dailyCounts = [];
  try {
    dailyCounts = await Card.aggregate([
      {
        $match: { author: new mongoose.Types.ObjectId(_id), isDeleted: false },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
  } catch (error) {
    console.error("Error fetching daily counts:", error);
  }
  const languageReport = await Card.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(_id), isDeleted: false } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json({
    totalCards,
    totalFolders,
    totalTags,
    dailyCounts,
    languageReport,
  });
});
app.get("/lastactive", async (req, res) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    const userId = decode.checkUser._id;
    const lastActiveTime = await User.findByIdAndUpdate(
      userId,
      { lastActive: Date.now() },
      { new: true }
    );
    const t = new Date(lastActiveTime.lastActive).toLocaleString();
    res.json({ success: true, t });
  } catch (e) {
    console.log("ERROR:", e);
    res.status(500).json({ success: false });
  }
});
app.get("/a", authMiddleware, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id, userName, goodName, email, userImage, lastActive } =
    decode.checkUser;
  const data = await User.findById(_id);
  const links = data.links;
  res.json({ _id, userName, goodName, email, userImage, lastActive, links });
});
app.get("/popularcards", async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);
  const userId = decode.checkUser._id;

  res.render("");
});

app.get("/followers/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    if (!token)
      return res.status(401).json({ status: false, message: "Unauthorized" });
    const { _id, userName, email, userImage } = decode.checkUser;
    const userInfo = await User.findById(_id);
    const targetUser = req.params.id;
    const user = await User.findById(targetUser || _id);
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });
    const target = await User.findById(targetUser);
    if (!target)
      return res.status(404).json({ status: false, message: "User not found" });
    const followers = await User.find({
      _id: { $in: target.followers },
    }).populate("followers");
    res.render("followers", {
      followers,
      user,
      userInfo,
      image: userImage,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error", { error: "Server Error, Please try again" });
  }
});
app.get("/following/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, process.env.SECRET);
    if (!token)
      return res.status(401).json({ status: false, message: "Unauthorized" });
    const { _id, userName, email, userImage } = decode.checkUser;
    const userInfo = await User.findById(_id);
    const targetUser = req.params.id;
    const user = await User.findById(targetUser || _id);
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });
    const target = await User.findById(targetUser);
    if (!target)
      return res.status(404).json({ status: false, message: "User not found" });
    const following = await User.find({
      _id: { $in: target.following },
    }).populate("following");
    res.render("following", {
      following,
      user,
      userInfo,
      image: userImage,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error", { error: "Server Error, Please try again" });
  }
});

app.get("/cards/user/:user", async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.verify(token, process.env.SECRET);

  const user_id = req.params.user; // profile user
  const viewer_id = decode.checkUser._id; // logged-in user
  console.log(`User Id Is: ${user_id}`);
  console.log(`Viewer Id Is: ${viewer_id}`);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  const cards = await Card.find({
    author: new mongoose.Types.ObjectId(user_id),
    isDeleted: false,
  })
    .populate("author", "userName userImage")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  let card = await findFavPinned(cards, viewer_id);

  const len = await Card.find({
    author: user_id,
    isDeleted: false,
  }).countDocuments();

  const tags = await Card.distinct("tags");
  const folders = await Folder.find({
    author: user_id,
    isDeleted: false,
  });

  res.render("allCards", {
    card,
    image: decode.checkUser.userImage,
    author: decode.checkUser.userName,
    userId: viewer_id,
    len,
    folders,
    tags,
  });
});

app.get("/fav/user/:user", async (req, res) => {
  const token = req.cookies.token;
  const user_id = req.params.user;
  const decode = jwt.verify(token, process.env.SECRET);
  const { _id: userId, userImage: image, userName } = decode.checkUser;

  try {
    const user = await User.findById(user_id).populate({
      path: "favoriteCards",
      populate: { path: "author", select: "userName userImage _id" },
      options: { limit: 10 },
    });
    const card = await findFavPinned(user.favoriteCards, user_id);
    const folders = await Folder.find({ author: userId, isDeleted: false });

    res.render("fav", {
      card: card,
      image,
      author: userName,
      userId,
      folders,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/folder/user/:user", async (req, res) => {
  const token = req.cookies.token;
  const user_id = req.params.user;
  const decode = jwt.verify(token, process.env.SECRET);
  const userId = decode.checkUser._id;
  const image = decode.checkUser.userImage;
  const folders = await Folder.find({
    author: user_id,
    isDeleted: false,
  }).populate("author");
  const strg = BSON.calculateObjectSize(folders);
  res.render("folder", { folders, image, userId });
});

app.get("/version/card/:id", async (req, res) => {
  const id = req.params.id;
  const version = await Version.findOne({ _id: id }).populate("cardId");
  res.json(version);
});

app.get("/location", async (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  const geo = await fetch(`https://ipapi.co/${ip}/json/`);
  const location = await geo.json();

  res.send(location);
});
app.use((req, res, next) => {
  res.status(404).render("pageNotFound");
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render("error", {
    error: "Internal Server Error, try again later or contact support",
  });
});
server.listen(3000, () => {
  console.log("Server started on port 3000");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
let rs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
);
global.appVersion = rs.version;
