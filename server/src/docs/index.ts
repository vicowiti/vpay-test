import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenAPISpec } from "./openapi"; // ← registry initialized here

// ✅ import schemas after registry is ready
import "./schemas/auth";
import "./schemas/accounts";
import "./schemas/transactions";

const router = Router();
const spec = generateOpenAPISpec();

router.use("/", swaggerUi.serve);
router.get(
  "/",
  swaggerUi.setup(spec, {
    customSiteTitle: "VunaPay API Docs",
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);

export default router;
