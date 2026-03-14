import { Request, Response, NextFunction } from "express";
import { AuthService } from "./../services/auth";

const authService = new AuthService();

export class AuthController {
  // POST /api/auth/register
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { firstName, lastName, email, password } = req.body;

      await authService.register({
        firstName,
        lastName,
        email,
        password,
      });

      res.status(201).json({ success: true });
      return;
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const token = await authService.login({ email, password });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
