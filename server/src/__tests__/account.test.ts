import { AccountService } from "../services/accounts";
import { AppError } from "../middleware/error";

const mockLimit = jest.fn();
const mockValues = jest.fn();
const mockWhere = jest.fn();

jest.mock("../db", () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: mockLimit }) }) }),
    insert: () => ({ values: mockValues }),
    update: () => ({ set: () => ({ where: mockWhere }) }),
  },
}));

const accountService = new AccountService();

const mockAccount = {
  id: 1,
  userId: 1,
  balance: "1000.00",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("AccountService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("createAccount", () => {
    it("should create an account successfully", async () => {
      mockValues.mockResolvedValueOnce([]);

      await expect(
        accountService.createAccount({ userId: 1 }),
      ).resolves.toBeUndefined();
    });

    it("should throw 500 on unexpected error", async () => {
      mockValues.mockRejectedValueOnce(new Error("DB error"));

      await expect(accountService.createAccount({ userId: 1 })).rejects.toThrow(
        new AppError("Failed to create account", 500),
      );
    });
  });

  describe("getUserAccounts", () => {
    it("should return list of active accounts for a user", async () => {
      // getUserAccounts uses .where() directly without .limit()
      const mockSelectChain = {
        from: () => ({
          where: jest.fn().mockResolvedValueOnce([mockAccount]),
        }),
      };
      const { db } = require("../db");
      db.select.mockReturnValueOnce(mockSelectChain);

      const result = await accountService.getUserAccounts(1);
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(1);
    });

    it("should return empty array if no accounts found", async () => {
      const mockSelectChain = {
        from: () => ({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      };
      const { db } = require("../db");
      db.select.mockReturnValueOnce(mockSelectChain);

      const result = await accountService.getUserAccounts(1);
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountById", () => {
    it("should return account if found", async () => {
      mockLimit.mockResolvedValueOnce([mockAccount]);

      const result = await accountService.getAccountById(1, 1);
      expect(result.id).toBe(1);
      expect(result.userId).toBe(1);
    });

    it("should throw 404 if account not found", async () => {
      mockLimit.mockResolvedValueOnce([]);

      await expect(accountService.getAccountById(99, 1)).rejects.toThrow(
        new AppError("Account not found", 404),
      );
    });
  });

  describe("deleteAccount", () => {
    it("should soft delete an account successfully", async () => {
      mockLimit.mockResolvedValueOnce([mockAccount]);
      mockWhere.mockResolvedValueOnce([]);

      await expect(accountService.deleteAccount(1, 1)).resolves.toBeUndefined();
    });

    it("should throw 404 if account not found", async () => {
      mockLimit.mockResolvedValueOnce([]);

      await expect(accountService.deleteAccount(99, 1)).rejects.toThrow(
        new AppError("Account not found", 404),
      );
    });
  });
});
