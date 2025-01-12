const express = require("express");
const { DB, auth, userTimers, updateTimer } = require("../db/db.js");

const router = express.Router();

router.post("/api/timers", auth(), userTimers(), async (req, res) => {
  const { description } = req.body;

  const newTimer = {
    start: Date.now(),
    progress: 0,
    description: description,
    isActive: true,
    id: crypto.randomUUID(),
    userId: req.user._id,
  };

  DB.timers.push(newTimer);

  res.json(newTimer);
});

router.post("/api/timers/:id/stop", auth(), userTimers(), async (req, res) => {
  const id = req.params.id;

  DB.timers.map((timer) => {
    if (timer.id === id) {
      timer.isActive = false;
      timer.end = Date.now();
      timer.duration = Date.now() - timer.start;
    }
  });

  res.redirect("/");
});

router.get("/api/timers", auth(), userTimers(), async (req, res) => {
  const isActive = req.query.isActive;

  if (isActive === "true") {
    if (req.activeTimer) {
      req.activeTimer.map((timer) => {
        setInterval(() => {
          updateTimer(timer);
        }, 1000);
      });
      return res.json(req.activeTimer);
    } else {
      res.send({ message: "activeTimer not found" });
    }
  }

  if (isActive === "false") {
    if (req.disactiveTimer) {
      return res.json(req.disactiveTimer);
    } else {
      res.send({ message: "disactiveTimer not found" });
    }
  }
});

module.exports = router;
