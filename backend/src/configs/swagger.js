import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load base Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, "../docs/openapi.yaml"));

// Dynamically merge path specifications from separate files
const pathsDir = path.join(__dirname, "../docs/paths");
fs.readdirSync(pathsDir).forEach((file) => {
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    const pathSpec = YAML.load(path.join(pathsDir, file));
    swaggerDocument.paths = { ...swaggerDocument.paths, ...pathSpec };
  }
});

// Setup Swagger UI (non-production only)
const setupSwagger = (app) => {
  if (process.env.NODE_ENV !== "production") {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
};

export default setupSwagger;
