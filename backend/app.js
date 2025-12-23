import express from "express";
import { PORT } from "./src/configs/env.js";
import pool from "./src/configs/database.js";
import authRouter from "./src/routes/auth.routes.js";
import userRouter from "./src/routes/user.routes.js";
import errorHandling from "./src/middleware/errorHandler.js";
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api", userRouter);

// Error handling Middleware
app.use(errorHandling);

// Test postgre connection
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.send(`The database name is ${result.rows[0].current_database}`);
});

// Server Running
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
