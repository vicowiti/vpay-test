import { Router } from "express";

import { TransactionController } from "./../controllers/transactions";
import { AuthMiddleware } from "./../middleware/auth";

const TransactionRouter = Router();
const transactionController = new TransactionController();

TransactionRouter.post(
  "/deposit",
  AuthMiddleware.protect,
  transactionController.deposit.bind(transactionController),
);
TransactionRouter.post(
  "/transfer",
  AuthMiddleware.protect,
  transactionController.transfer.bind(transactionController),
);
TransactionRouter.post(
  "/reverse",
  AuthMiddleware.protect,
  transactionController.reverse.bind(transactionController),
);
TransactionRouter.get(
  "/:accountId",
  AuthMiddleware.protect,
  transactionController.getTransactionsByAccount.bind(transactionController),
);

export default TransactionRouter;
