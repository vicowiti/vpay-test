"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
app.listen(process.env.PORT || 9090, () => console.log("server is running on PORT: " + process.env.PORT));
//# sourceMappingURL=index.js.map