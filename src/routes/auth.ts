import { Router } from "express";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, findUserById } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const MIN_PASSWORD_LENGTH = 8;

function validateEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length < 3 || trimmed.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const email = validateEmail(req.body?.email);
  const password = req.body?.password;

  if (!email) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    });
    return;
  }

  if (findUserByEmail(email)) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = createUser(email, passwordHash);

  req.session.userId = user.id;
  res.status(201).json({
    message: "Registered and logged in",
    user: { id: user.id, email: user.email },
  });
});

authRouter.post("/login", async (req, res) => {
  const email = validateEmail(req.body?.email);
  const password = req.body?.password;

  if (!email || typeof password !== "string") {
    res.status(400).json({ error: "Invalid email or password" });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;
  res.json({ message: "Logged in", user: { id: user.id, email: user.email } });
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not log out" });
      return;
    }
    res.clearCookie("sid", { path: "/" });
    res.json({ message: "Logged out" });
  });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = findUserById(req.session.userId!);
  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Session invalid" });
    return;
  }
  res.json({ user: { id: user.id, email: user.email } });
});
