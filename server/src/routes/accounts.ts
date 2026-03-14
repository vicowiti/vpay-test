import { Router } from "express";

import { AccountController } from "./../controllers/accounts";
import { AuthMiddleware } from "./../middleware/auth";

const AccountRouter = Router();
const accountController = new AccountController();

AccountRouter.post(
  "/",
  AuthMiddleware.protect,
  accountController.createAccount.bind(accountController),
);
AccountRouter.get(
  "/",
  AuthMiddleware.protect,
  accountController.getUserAccounts.bind(accountController),
);
AccountRouter.get(
  "/:id",
  AuthMiddleware.protect,
  accountController.getAccountById.bind(accountController),
);
AccountRouter.delete(
  "/:id",
  AuthMiddleware.protect,
  accountController.deleteAccount.bind(accountController),
);

export default AccountRouter;
