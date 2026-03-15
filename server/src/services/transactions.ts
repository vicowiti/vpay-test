import { AppError } from "../middleware/error";
import { db } from "../db";
import { accounts, transactions } from "../db/schema";
import { eq, and, or } from "drizzle-orm";
import { log } from "node:console";

interface DepositPayload {
  toAccountId: number;
  amount: number;
  note?: string;
}

interface TransferPayload {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  note?: string;
}

interface ReversalPayload {
  transactionId: number;
  userId: number;
}

export class TransactionService {
  // Deposit funds into an account
  async deposit(payload: DepositPayload): Promise<void> {
    try {
      const { toAccountId, amount, note } = payload;
      const toAccount = await this.getActiveAccount(toAccountId);

      if (amount <= 0) throw new AppError("Invalid amount", 400);

      // Update balance
      await db
        .update(accounts)
        .set({ balance: String(parseFloat(toAccount.balance) + amount) })
        .where(eq(accounts.id, toAccountId));

      // Record transaction
      await db.insert(transactions).values({
        toAccountId,
        fromAccountId: null,
        amount: String(amount),
        type: "deposit",
        status: "completed",
        note: note ?? null,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.log(error);

      throw new AppError("Failed to process deposit", 500);
    }
  }

  // Transfer funds between two accounts
  async transfer(payload: TransferPayload, userId: number): Promise<void> {
    try {
      const { fromAccountId, toAccountId, amount, note } = payload;

      const fromAccount = await this.getActiveAccount(fromAccountId);
      const toAccount = await this.getActiveAccount(toAccountId);

      if (amount <= 0) throw new AppError("Invalid amount", 400);

      if (fromAccount.userId !== userId) {
        throw new AppError("Access denied", 403);
      }

      if (parseFloat(fromAccount.balance) < amount) {
        throw new AppError("Insufficient funds", 400);
      }

      // Atomic transaction — all or nothing
      await db.transaction(async (tx) => {
        // Deduct from sender
        await tx
          .update(accounts)
          .set({ balance: String(parseFloat(fromAccount.balance) - amount) })
          .where(eq(accounts.id, fromAccountId));

        // Add to receiver
        await tx
          .update(accounts)
          .set({ balance: String(parseFloat(toAccount.balance) + amount) })
          .where(eq(accounts.id, toAccountId));

        // Record transaction
        await tx.insert(transactions).values({
          fromAccountId,
          toAccountId,
          amount: String(amount),
          type: "transfer",
          status: "completed",
          note: note ?? null,
        });
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to process transfer", 500);
    }
  }

  async reverse(payload: ReversalPayload): Promise<void> {
    try {
      const { transactionId, userId } = payload;

      // Get the original transaction
      const [originalTransaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .limit(1);

      if (!originalTransaction)
        throw new AppError("Transaction not found", 404);

      // Can't reverse an already reversed transaction
      if (originalTransaction.status === "reversed") {
        throw new AppError("Transaction already reversed", 400);
      }

      // Can't reverse a reversal
      if (originalTransaction.type === "reversal") {
        throw new AppError("Cannot reverse a reversal", 400);
      }

      // Validate the fromAccount belongs to the requesting user
      if (originalTransaction.fromAccountId) {
        const fromAccount = await this.getActiveAccount(
          originalTransaction.fromAccountId,
        );
        if (fromAccount.userId !== userId) {
          throw new AppError("Access denied", 403);
        }
      }

      await db.transaction(async (tx) => {
        // Move money back
        if (
          originalTransaction.type === "transfer" &&
          originalTransaction.fromAccountId
        ) {
          const fromAccount = await this.getActiveAccount(
            originalTransaction.fromAccountId,
          );
          const toAccount = await this.getActiveAccount(
            originalTransaction.toAccountId,
          );

          // Deduct from receiver
          await tx
            .update(accounts)
            .set({
              balance: String(
                parseFloat(toAccount.balance) -
                  parseFloat(originalTransaction.amount),
              ),
            })
            .where(eq(accounts.id, originalTransaction.toAccountId));

          // Refund sender
          await tx
            .update(accounts)
            .set({
              balance: String(
                parseFloat(fromAccount.balance) +
                  parseFloat(originalTransaction.amount),
              ),
            })
            .where(eq(accounts.id, originalTransaction.fromAccountId));
        }

        if (originalTransaction.type === "deposit") {
          const toAccount = await this.getActiveAccount(
            originalTransaction.toAccountId,
          );

          // Deduct the deposit amount
          await tx
            .update(accounts)
            .set({
              balance: String(
                parseFloat(toAccount.balance) -
                  parseFloat(originalTransaction.amount),
              ),
            })
            .where(eq(accounts.id, originalTransaction.toAccountId));
        }

        // Mark original transaction as reversed
        await tx
          .update(transactions)
          .set({ status: "reversed" })
          .where(eq(transactions.id, transactionId));

        // Record the reversal transaction
        await tx.insert(transactions).values({
          fromAccountId: originalTransaction.toAccountId,
          toAccountId:
            originalTransaction.fromAccountId ??
            originalTransaction.toAccountId,
          amount: originalTransaction.amount,
          type: "reversal",
          status: "completed",
          note: `Reversal of transaction #${transactionId}`,
          reversalOfId: transactionId,
        });
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to process reversal", 500);
    }
  }

  async getTransactionsByAccount(
    accountId: number,
    userId: number,
  ): Promise<(typeof transactions.$inferSelect)[]> {
    try {
      const account = await this.getActiveAccount(accountId);
      if (account.userId !== userId) {
        throw new AppError("Access denied", 403);
      }

      const transactionsList = await db
        .select()
        .from(transactions)
        .where(
          or(
            eq(transactions.toAccountId, accountId),
            eq(transactions.fromAccountId, accountId),
          ),
        );

      return transactionsList;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch transactions", 500);
    }
  }

  // Helper — get account and validate it exists and is active
  private async getActiveAccount(
    accountId: number,
  ): Promise<typeof accounts.$inferSelect> {
    try {
      log("Fetching account with ID:", accountId);
      const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, accountId), eq(accounts.isActive, true)))
        .limit(1);

      if (!account) throw new AppError("Account not found", 404);
      return account;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch account", 500);
    }
  }
}
