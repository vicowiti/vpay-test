import {
  pgTable,
  serial,
  integer,
  numeric,
  timestamp,
  pgEnum,
  text,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit",
  "transfer",
  "reversal",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
  "reversed",
]);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fromAccountId: integer("from_account_id").references(() => accounts.id),
  toAccountId: integer("to_account_id")
    .notNull()
    .references(() => accounts.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  note: text("note"),
  reversalOfId: integer("reversal_of_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
