import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import { ErrorMiddleware } from "./middleware/error";
import cookieparser from "cookie-parser";
import AuthRouter from "./routes/auth";

const app = express();
app.use(express.json());
app.use(cookieparser());

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

//My Routes
app.use("/api/auth", AuthRouter);

// Error middleware

app.use(ErrorMiddleware.errorHandler);
app.use(ErrorMiddleware.notFound);

app.listen(process.env.PORT || 9090, () =>
  console.log("server is running on PORT: " + process.env.PORT),
);
