import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

interface JwtPayload {
  id: number;
}

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect;
    }
  }
}

export class AuthMiddleware {
  static async protect(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // 1. Pull token from HttpOnly cookie
      const token = req.cookies?.token;

      if (!token) {
        throw new AppError("Unauthorized - no token", 401);
      }

      // 2. Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "",
      ) as JwtPayload;

      if (!decoded?.id) {
        throw new AppError("Unauthorized - invalid token", 401);
      }

      // 3. Check user exists in DB
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id))
        .limit(1);

      if (!user) {
        throw new AppError("Unauthorized - user not found", 401);
      }

      // 4. Attach user to request
      req.user = user;

      next();
    } catch (err) {
      next(err);
    }
  }
}
