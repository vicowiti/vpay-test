import "dotenv/config";
import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// ✅ registry is created FIRST
export const registry = new OpenAPIRegistry();

// ✅ schemas imported AFTER registry is exported
import "./schemas/auth";
import "./schemas/accounts";
import "./schemas/transactions";

export function generateOpenAPISpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "VunaPay Wallet API",
      version: "1.0.0",
      description: "Mini Wallet Transaction API",
    },
    servers: [{ url: "/api" }],
    security: [{ cookieAuth: [] }],
  });
}

registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "token",
});
