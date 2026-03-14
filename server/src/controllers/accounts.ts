import { Request, Response, NextFunction } from "express";
import { AccountService } from "./../services/accounts";
import { AppError } from "../middleware/error";

const accountService = new AccountService();

export class AccountController {
  // POST /api/accounts
  async createAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId: number = req.user?.id as number;
      await accountService.createAccount({ userId });
      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/accounts
  async getUserAccounts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId: number = req.user?.id as number;
      const accounts = await accountService.getUserAccounts(userId);
      res.json({ accounts });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/accounts/:id
  async getAccountById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const accountSelected: string = req.params.id as string;
      const accountId = parseInt(accountSelected);
      const userId = req.user?.id as number;
      const account = await accountService.getAccountById(accountId, userId);
      res.status(200).json({ account });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/accounts/:id
  async deleteAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const accountSelected: string = req.params.id as string;
      const accountId = parseInt(accountSelected);
      const userId = req.user?.id as number;
      await accountService.deleteAccount(accountId, userId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
