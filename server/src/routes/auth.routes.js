const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { signAccessToken } = require("../utils/jwt");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ✅ (dev) seed/register user — ในงานจริงมักแยกเป็น admin create user
router.post("/register", async (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email & password required" });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    name: name || "",
    role: role || "user",
  });

  return res.status(201).json({
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
});

// ✅ login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email & password required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return res.json({
    accessToken,
    user: { id: user._id, email: user.email, name: user.name, role: user.role },
  });
});

// ✅ current user (ทดสอบ token)
router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
