import { z } from "zod";
import { registry } from "../openapi";

// --- Schemas ---
export const RegisterSchema = registry.register(
  "Register",
  z.object({
    firstName: z.string().openapi({ example: "John" }),
    lastName: z.string().openapi({ example: "Doe" }),
    email: z.string().email().openapi({ example: "john@example.com" }),
    password: z.string().min(6).openapi({ example: "password123" }),
  }),
);

export const LoginSchema = registry.register(
  "Login",
  z.object({
    email: z.string().email().openapi({ example: "john@example.com" }),
    password: z.string().openapi({ example: "password123" }),
  }),
);

export const SuccessResponseSchema = registry.register(
  "SuccessResponse",
  z.object({
    success: z.boolean().openapi({ example: true }),
  }),
);

// --- Paths ---
registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: { "application/json": { schema: RegisterSchema } },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: { "application/json": { schema: SuccessResponseSchema } },
    },
    409: { description: "Email already in use" },
    500: { description: "Internal server error" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Login a user",
  request: {
    body: {
      content: { "application/json": { schema: LoginSchema } },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: SuccessResponseSchema } },
    },
    400: { description: "Invalid credentials" },
    500: { description: "Internal server error" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Logout a user",
  responses: {
    200: {
      description: "Logout successful",
      content: { "application/json": { schema: SuccessResponseSchema } },
    },
  },
});
