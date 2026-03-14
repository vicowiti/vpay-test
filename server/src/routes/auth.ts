import { Router } from "express";

import { AuthController } from "./../controllers/auth";

const AuthRouter = Router();
const authController = new AuthController();

AuthRouter.post("/register", authController.register.bind(authController));
AuthRouter.post("/login", authController.login.bind(authController));
AuthRouter.post("/logout", authController.logout.bind(authController));

export default AuthRouter;
