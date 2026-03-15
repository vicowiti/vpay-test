import { TransactionService } from "../services/transactions";
import { AppError } from "../middleware/error";

const mockLimit = jest.fn();
const mockValues = jest.fn();
const mockWhere = jest.fn();

jest.mock("../db", () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: mockLimit }) }) }),
    insert: () => ({ values: mockValues }),
    update: () => ({ set: () => ({ where: mockWhere }) }),
    transaction: jest.fn().mockImplementation(async (cb: any) => {
      await cb({
        select: () => ({
          from: () => ({ where: () => ({ limit: mockLimit }) }),
        }),
        insert: () => ({ values: mockValues }),
        update: () => ({ set: () => ({ where: mockWhere }) }),
      });
    }),
  },
}));

const transactionService = new TransactionService();

const mockAccount = (id: number, userId: number, balance: string) => ({
  id,
  userId,
  balance,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("TransactionService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("deposit", () => {
    it("should deposit successfully", async () => {
      mockLimit.mockResolvedValueOnce([mockAccount(1, 1, "1000.00")]);
      mockWhere.mockResolvedValueOnce([]);
      mockValues.mockResolvedValueOnce([]);

      await expect(
        transactionService.deposit({ toAccountId: 1, amount: 500 }),
      ).resolves.toBeUndefined();
    });

    it("should throw 400 for invalid amount", async () => {
      await expect(
        transactionService.deposit({ toAccountId: 1, amount: -100 }),
      ).rejects.toThrow(new AppError("Invalid amount", 400));
    });

    it("should throw 400 for zero amount", async () => {
      await expect(
        transactionService.deposit({ toAccountId: 1, amount: 0 }),
      ).rejects.toThrow(new AppError("Invalid amount", 400));
    });

    it("should throw 404 if account not found", async () => {
      mockLimit.mockResolvedValueOnce([]);

      await expect(
        transactionService.deposit({ toAccountId: 99, amount: 500 }),
      ).rejects.toThrow(new AppError("Account not found", 404));
    });
  });

  describe("transfer", () => {
    it("should transfer successfully", async () => {
      mockLimit
        .mockResolvedValueOnce([mockAccount(1, 1, "1000.00")])
        .mockResolvedValueOnce([mockAccount(2, 2, "500.00")]);
      mockWhere.mockResolvedValue([]);
      mockValues.mockResolvedValueOnce([]);

      await expect(
        transactionService.transfer(
          { fromAccountId: 1, toAccountId: 2, amount: 200 },
          1,
        ),
      ).resolves.toBeUndefined();
    });

    it("should throw 400 for insufficient funds", async () => {
      mockLimit
        .mockResolvedValueOnce([mockAccount(1, 1, "100.00")])
        .mockResolvedValueOnce([mockAccount(2, 2, "500.00")]);

      await expect(
        transactionService.transfer(
          { fromAccountId: 1, toAccountId: 2, amount: 500 },
          1,
        ),
      ).rejects.toThrow(new AppError("Insufficient funds", 400));
    });

    it("should throw 403 if account does not belong to user", async () => {
      mockLimit
        .mockResolvedValueOnce([mockAccount(1, 2, "1000.00")])
        .mockResolvedValueOnce([mockAccount(2, 3, "500.00")]);

      await expect(
        transactionService.transfer(
          { fromAccountId: 1, toAccountId: 2, amount: 200 },
          1,
        ),
      ).rejects.toThrow(new AppError("Access denied", 403));
    });

    it("should throw 400 for invalid amount", async () => {
      await expect(
        transactionService.transfer(
          { fromAccountId: 1, toAccountId: 2, amount: 0 },
          1,
        ),
      ).rejects.toThrow(new AppError("Invalid amount", 400));
    });

    it("should throw 400 for negative amount", async () => {
      await expect(
        transactionService.transfer(
          { fromAccountId: 1, toAccountId: 2, amount: -50 },
          1,
        ),
      ).rejects.toThrow(new AppError("Invalid amount", 400));
    });
  });

  describe("reverse", () => {
    it("should throw 404 if transaction not found", async () => {
      mockLimit.mockResolvedValueOnce([]);

      await expect(
        transactionService.reverse({ transactionId: 99, userId: 1 }),
      ).rejects.toThrow(new AppError("Transaction not found", 404));
    });

    it("should throw 400 if transaction already reversed", async () => {
      mockLimit.mockResolvedValueOnce([
        {
          id: 1,
          status: "reversed",
          type: "transfer",
          fromAccountId: 1,
          toAccountId: 2,
          amount: "200.00",
        },
      ]);

      await expect(
        transactionService.reverse({ transactionId: 1, userId: 1 }),
      ).rejects.toThrow(new AppError("Transaction already reversed", 400));
    });

    it("should throw 400 if trying to reverse a reversal", async () => {
      mockLimit.mockResolvedValueOnce([
        {
          id: 1,
          status: "completed",
          type: "reversal",
          fromAccountId: 1,
          toAccountId: 2,
          amount: "200.00",
        },
      ]);

      await expect(
        transactionService.reverse({ transactionId: 1, userId: 1 }),
      ).rejects.toThrow(new AppError("Cannot reverse a reversal", 400));
    });

    it("should reverse a transfer successfully", async () => {
      // fetch original transaction
      mockLimit
        .mockResolvedValueOnce([
          {
            id: 1,
            status: "completed",
            type: "transfer",
            fromAccountId: 1,
            toAccountId: 2,
            amount: "200.00",
          },
        ])
        // fetch fromAccount for ownership check
        .mockResolvedValueOnce([mockAccount(1, 1, "800.00")])
        // fetch fromAccount inside transaction block
        .mockResolvedValueOnce([mockAccount(1, 1, "800.00")])
        // fetch toAccount inside transaction block
        .mockResolvedValueOnce([mockAccount(2, 2, "700.00")]);

      mockWhere.mockResolvedValue([]);
      mockValues.mockResolvedValueOnce([]);

      await expect(
        transactionService.reverse({ transactionId: 1, userId: 1 }),
      ).resolves.toBeUndefined();
    });
  });

  describe("getTransactionsByAccount", () => {
    it("should return transactions for an account", async () => {
      mockLimit.mockResolvedValueOnce([mockAccount(1, 1, "1000.00")]);
      mockWhere.mockResolvedValueOnce([
        {
          id: 1,
          toAccountId: 1,
          amount: "500.00",
          type: "deposit",
          status: "completed",
        },
        {
          id: 2,
          fromAccountId: 1,
          toAccountId: 2,
          amount: "200.00",
          type: "transfer",
          status: "completed",
        },
      ]);

      const result = await transactionService.getTransactionsByAccount(1, 1);
      expect(result).toHaveLength(2);
    });

    it("should return empty array if no transactions found", async () => {
      mockLimit.mockResolvedValueOnce([mockAccount(1, 1, "1000.00")]);
      mockWhere.mockResolvedValueOnce([]);

      const result = await transactionService.getTransactionsByAccount(1, 1);
      expect(result).toHaveLength(0);
    });

    it("should throw 403 if account does not belong to user", async () => {
      mockLimit.mockResolvedValueOnce([mockAccount(1, 2, "1000.00")]); // userId 2, not 1

      await expect(
        transactionService.getTransactionsByAccount(1, 1),
      ).rejects.toThrow(new AppError("Access denied", 403));
    });

    it("should throw 404 if account not found", async () => {
      mockLimit.mockResolvedValueOnce([]);

      await expect(
        transactionService.getTransactionsByAccount(99, 1),
      ).rejects.toThrow(new AppError("Account not found", 404));
    });
  });
});
