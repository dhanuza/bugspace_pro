import type { Request, Response, NextFunction } from "express";
import type { Role } from "../types/index.js";

export function verifyRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
