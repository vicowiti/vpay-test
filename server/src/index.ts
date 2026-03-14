import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";

const app = express();

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(process.env.PORT || 9090, () =>
  console.log("server is running on PORT: " + process.env.PORT),
);
