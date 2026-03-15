import { Request, Response, NextFunction } from "express";

import { TransactionService } from "./../services/transactions";

const transactionService = new TransactionService();

export class TransactionController {
  // POST /api/transactions/deposit
  async deposit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { toAccountId, amount, note } = req.body;
      const userId = req.user?.id as number;
      await transactionService.deposit({ toAccountId, amount, note });
      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/transactions/transfer
  async transfer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id as number;
      const { fromAccountId, toAccountId, amount, note } = req.body;
      await transactionService.transfer(
        {
          fromAccountId,
          toAccountId,
          amount,
          note,
        },
        userId,
      );
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/transactions/reverse
  async reverse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id as number;
      const { transactionId } = req.body;
      const transaction = await transactionService.reverse({
        transactionId,
        userId,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/transactions/:accountId
  async getTransactionsByAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id as number;
      console.log("params", req.params);
      const accountSelected: string = req.params.accountId as string;
      const transactions = await transactionService.getTransactionsByAccount(
        accountSelected as unknown as number,
        userId,
      );

      res.status(200).json({ transactions });
    } catch (error) {
      next(error);
    }
  }
}
