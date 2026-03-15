import { z } from "zod";
import { registry } from "../openapi";

// --- Schemas ---
export const AccountSchema = registry.register(
  "Account",
  z.object({
    id: z.number().openapi({ example: 1 }),
    userId: z.number().openapi({ example: 1 }),
    balance: z.string().openapi({ example: "1000.00" }),
    isActive: z.boolean().openapi({ example: true }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  }),
);

export const AccountsListSchema = registry.register(
  "AccountsList",
  z.object({
    accounts: z.array(AccountSchema),
  }),
);

export const AccountResponseSchema = registry.register(
  "AccountResponse",
  z.object({
    account: AccountSchema,
  }),
);

// --- Paths ---
registry.registerPath({
  method: "post",
  path: "/accounts",
  tags: ["Accounts"],
  summary: "Create a new account",
  security: [{ cookieAuth: [] }],
  responses: {
    201: {
      description: "Account created successfully",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean().openapi({ example: true }) }),
        },
      },
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});

registry.registerPath({
  method: "get",
  path: "/accounts",
  tags: ["Accounts"],
  summary: "Get all accounts for the authenticated user",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "List of accounts",
      content: { "application/json": { schema: AccountsListSchema } },
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});

registry.registerPath({
  method: "get",
  path: "/accounts/{id}",
  tags: ["Accounts"],
  summary: "Get a single account by ID",
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: {
      description: "Account details",
      content: { "application/json": { schema: AccountResponseSchema } },
    },
    401: { description: "Unauthorized" },
    403: { description: "Access denied" },
    404: { description: "Account not found" },
    500: { description: "Internal server error" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/accounts/{id}",
  tags: ["Accounts"],
  summary: "Soft delete an account",
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: {
      description: "Account deleted successfully",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean().openapi({ example: true }) }),
        },
      },
    },
    401: { description: "Unauthorized" },
    403: { description: "Access denied" },
    404: { description: "Account not found" },
    500: { description: "Internal server error" },
  },
});
