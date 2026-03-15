import { AuthService } from "../services/auth";
import { AppError } from "../middleware/error";
import bcrypt from "bcrypt";

const mockLimit = jest.fn();
const mockValues = jest.fn();

jest.mock("../db", () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: mockLimit }) }) }),
    insert: () => ({ values: mockValues }),
  },
}));

const authService = new AuthService();

describe("AuthService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("register", () => {
    it("should register a new user successfully", async () => {
      mockLimit.mockResolvedValueOnce([]);
      mockValues.mockResolvedValueOnce([]);

      await expect(
        authService.register({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "password123",
        }),
      ).resolves.toBeUndefined();
    });

    it("should throw 409 if email already exists", async () => {
      mockLimit.mockResolvedValueOnce([{ id: 1, email: "john@example.com" }]);

      await expect(
        authService.register({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(new AppError("Email already in use", 409));
    });

    it("should throw 500 on unexpected error", async () => {
      mockLimit.mockRejectedValueOnce(new Error("DB connection failed"));

      await expect(
        authService.register({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(new AppError("Could not register User", 500));
    });
  });

  describe("login", () => {
    it("should throw 400 if user does not exist", async () => {
      mockLimit.mockResolvedValueOnce([]);

      await expect(
        authService.login({
          email: "ghost@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(new AppError("Invalid credentials", 400));
    });

    it("should throw 400 if password is incorrect", async () => {
      mockLimit.mockResolvedValueOnce([
        { id: 1, email: "john@example.com", passwordHash: "wronghash" },
      ]);

      await expect(
        authService.login({
          email: "john@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow(new AppError("Invalid credentials", 400));
    });

    it("should return a token on successful login", async () => {
      const hash = await bcrypt.hash("password123", 12);
      mockLimit.mockResolvedValueOnce([
        { id: 1, email: "john@example.com", passwordHash: hash },
      ]);

      const token = await authService.login({
        email: "john@example.com",
        password: "password123",
      });

      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });
  });
});
