import express from "express";
import { PORT } from "./src/configs/env.js";
import pool from "./src/configs/database.js";
import errorHandling from "./src/middleware/error.middleware.js";
import initModels from "./src/models/index.js";
import cookieParser from "cookie-parser";
import employeeAuthRouter from "./src/routes/employeeAuth.routes.js";
import testRouter from "./src/routes/test.routes.js";
import customerAuthRouter from "./src/routes/customerAuth.routes.js";
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser())

// Routes
app.use("/api", testRouter);
app.use("/api/employee", employeeAuthRouter);
app.use("/api/customer", customerAuthRouter);

// Error handling Middleware
app.use(errorHandling);

// Create Tables
// await initModels(pool);

// Server Running
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
