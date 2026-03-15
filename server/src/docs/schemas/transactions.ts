import { z } from "zod";
import { registry } from "../openapi";

// --- Schemas ---
export const TransactionSchema = registry.register(
  "Transaction",
  z.object({
    id: z.number().openapi({ example: 1 }),
    fromAccountId: z.number().nullable().openapi({ example: null }),
    toAccountId: z.number().openapi({ example: 2 }),
    amount: z.string().openapi({ example: "500.00" }),
    type: z
      .enum(["deposit", "transfer", "reversal"])
      .openapi({ example: "transfer" }),
    status: z
      .enum(["pending", "completed", "failed", "reversed"])
      .openapi({ example: "completed" }),
    note: z.string().nullable().openapi({ example: "Payment for services" }),
    reversalOfId: z.number().nullable().openapi({ example: null }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  }),
);

export const DepositSchema = registry.register(
  "Deposit",
  z.object({
    toAccountId: z.number().openapi({ example: 1 }),
    amount: z.number().positive().openapi({ example: 500 }),
    note: z.string().optional().openapi({ example: "Initial deposit" }),
  }),
);

export const TransferSchema = registry.register(
  "Transfer",
  z.object({
    fromAccountId: z.number().openapi({ example: 1 }),
    toAccountId: z.number().openapi({ example: 2 }),
    amount: z.number().positive().openapi({ example: 200 }),
    note: z.string().optional().openapi({ example: "Rent payment" }),
  }),
);

export const ReversalSchema = registry.register(
  "Reversal",
  z.object({
    transactionId: z.number().openapi({ example: 1 }),
  }),
);

export const TransactionsListSchema = registry.register(
  "TransactionsList",
  z.object({
    transactions: z.array(TransactionSchema),
  }),
);

// --- Paths ---
registry.registerPath({
  method: "post",
  path: "/transactions/deposit",
  tags: ["Transactions"],
  summary: "Deposit funds into an account",
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: DepositSchema } },
    },
  },
  responses: {
    201: {
      description: "Deposit successful",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean().openapi({ example: true }) }),
        },
      },
    },
    400: { description: "Invalid amount" },
    401: { description: "Unauthorized" },
    404: { description: "Account not found" },
    500: { description: "Internal server error" },
  },
});

registry.registerPath({
  method: "post",
  path: "/transactions/transfer",
  tags: ["Transactions"],
  summary: "Transfer funds between two accounts",
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: TransferSchema } },
    },
  },
  responses: {
    200: {
      description: "Transfer successful",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean().openapi({ example: true }) }),
        },
      },
    },
    400: { description: "Invalid amount or insufficient funds" },
    401: { description: "Unauthorized" },
    403: { description: "Access denied" },
    404: { description: "Account not found" },
    500: { description: "Internal server error" },
  },
});

registry.registerPath({
  method: "post",
  path: "/transactions/reverse",
  tags: ["Transactions"],
  summary: "Reverse a previous transaction",
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: ReversalSchema } },
    },
  },
  responses: {
    200: {
      description: "Reversal successful",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean().openapi({ example: true }) }),
        },
      },
    },
    400: { description: "Transaction already reversed or cannot be reversed" },
    401: { description: "Unauthorized" },
    403: { description: "Access denied" },
    404: { description: "Transaction not found" },
    500: { description: "Internal server error" },
  },
});

registry.registerPath({
  method: "get",
  path: "/transactions/{accountId}",
  tags: ["Transactions"],
  summary: "Get transaction history for an account",
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      accountId: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: {
      description: "Transaction history",
      content: { "application/json": { schema: TransactionsListSchema } },
    },
    401: { description: "Unauthorized" },
    403: { description: "Access denied" },
    404: { description: "Account not found" },
    500: { description: "Internal server error" },
  },
});
