const express = require("express");

const bodyParser = require("body-parser");
const { DB, deleteSession, createSession, findUserByUsername, auth, hash } = require("../db/db.js");

const router = express.Router();

router.get("/", auth(), (req, res) => {
  res.render("index", {
    user: req.user,
    authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
    timersActive: req.activeTimer,
    timersDisactive: req.disactiveTimer,
  });
});

router.get("/logout", auth(), async (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }

  await deleteSession(req.sessionId);
  res.clearCookie("sessionId").redirect("/");
});

router.post("/login", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const user = await findUserByUsername(username);

  if (!user || user.password !== hash(password)) {
    res.redirect("/?authError=true");
  } else {
    const sessionId = await createSession(user._id);
    res.cookie("sessionId", sessionId, { httpOnly: true }).redirect("/");
  }
});

router.post("/signup", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  let newUser = {};

  if (username.length === 0 || password.length === 0) {
    res.redirect("/?authError=true");
  } else {
    newUser = {
      _id: crypto.randomUUID(),
      username: username,
      password: hash(password),
    };

    DB.users.push(newUser);
    res.redirect("/");
  }
});

module.exports = router;
