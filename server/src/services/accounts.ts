import { AppError } from "../middleware/error";
import { db } from "../db";
import { accounts } from "../db/schema";
import { eq, and } from "drizzle-orm";

interface CreateAccountPayload {
  userId: number;
}

export class AccountService {
  async createAccount(payload: CreateAccountPayload): Promise<void> {
    try {
      await db.insert(accounts).values({
        userId: payload.userId,
        isActive: true,
      });
    } catch (error) {
      throw new AppError("Failed to create account", 500);
    }
  }

  async getUserAccounts(
    userId: number,
  ): Promise<(typeof accounts.$inferSelect)[]> {
    try {
      const userAccounts = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)));

      return userAccounts;
    } catch (error) {
      throw new AppError("Failed to fetch accounts", 500);
    }
  }

  async getAccountById(
    accountId: number,
    userId: number,
  ): Promise<typeof accounts.$inferSelect> {
    try {
      const [account] = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.id, accountId),
            eq(accounts.userId, userId),
            eq(accounts.isActive, true),
          ),
        )
        .limit(1);

      if (!account) throw new AppError("Account not found", 404);

      return account;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Could not get account", 500);
    }
  }

  // Soft delete an account
  async deleteAccount(accountId: number, userId: number): Promise<void> {}
}
