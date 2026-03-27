import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { authRouter } from "./routes/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const sessionSecret =
  process.env.SESSION_SECRET || "dev-only-change-me-not-for-production";

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  console.error("Set SESSION_SECRET in production.");
  process.exit(1);
}

app.use(helmet());
app.use(express.json());
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "sid",
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, try again later" },
});

app.use("/api/register", authLimiter);
app.use("/api/login", authLimiter);

app.use("/api", authRouter);
app.use(express.static(publicDir));

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}`);
});
