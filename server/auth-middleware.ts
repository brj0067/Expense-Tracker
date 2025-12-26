import { type Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any).userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
