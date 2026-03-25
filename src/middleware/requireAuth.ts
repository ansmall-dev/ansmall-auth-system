import type { RequestHandler } from "express";

/**
 * Only allows the request through if the session has a logged-in userId.
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.session.userId == null) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  next();
};
