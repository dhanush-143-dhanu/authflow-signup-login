const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "data", "users.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "change-this-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please log in first." });
  }
  next();
}

app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();

  if (users.some(user => user.email === normalizedEmail)) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    id: Date.now().toString(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  req.session.userId = user.id;
  res.status(201).json({
    message: "Account created successfully.",
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email.trim().toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  req.session.userId = user.id;
  res.json({
    message: "Login successful.",
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get("/api/me", requireLogin, (req, res) => {
  const user = readUsers().find(u => u.id === req.session.userId);

  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ message: "Session expired." });
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Could not log out." });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully." });
  });
});

app.get("/api/protected", requireLogin, (req, res) => {
  res.json({
    message: "This is protected data. Your session is valid.",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});