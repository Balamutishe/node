const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");
const users = require("./routes/users.js");
const timers = require("./routes/timers.js");

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.use("/", users, timers);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
