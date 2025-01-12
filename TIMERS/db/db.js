const crypto = require("crypto");

const hash = (data) => crypto.createHash("sha256").update(data).digest("hex");
const examplePassword = hash("pwd007");

const DB = {
  users: [
    {
      _id: crypto.randomUUID(),
      username: "admin",
      password: examplePassword,
    },
  ],
  sessions: {},
  timers: [],
};

const findUserByUsername = async (username) => {
  return DB.users.find((user) => user.username === username);
};

const findUserBySessionId = async (sessionId) => {
  const userId = DB.sessions[sessionId];
  if (!userId) return;
  return DB.users.find((u) => u._id === userId);
};

const createSession = async (userId) => {
  const sessionId = crypto.randomUUID();
  DB.sessions[sessionId] = userId;
  return sessionId;
};

const deleteSession = async (sessionId) => {
  delete DB.sessions[sessionId];
};

const findActiveTimers = async (value, userId) =>
  DB.timers.filter((t) => t.isActive === value).filter((t) => t.userId === userId);

const updateTimer = (timer) => (timer.progress = Date.now() - timer.start);

const userTimers = () => async (req, res, next) => {
  const activeTimer = await findActiveTimers(true, req.user._id);
  const disactiveTimer = await findActiveTimers(false, req.user._id);

  req.activeTimer = activeTimer;
  req.disactiveTimer = disactiveTimer;
  next();
};

const auth = () => async (req, res, next) => {
  if (!req.cookies["sessionId"]) {
    return next();
  }

  const user = await findUserBySessionId(req.cookies["sessionId"]);

  req.user = user;
  req.sessionId = req.cookies["sessionsId"];
  next();
};

module.exports = {
  DB,
  findUserByUsername,
  findUserBySessionId,
  createSession,
  deleteSession,
  findActiveTimers,
  updateTimer,
  auth,
  userTimers,
  hash,
};
