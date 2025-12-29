import express from "express";
import { PORT } from "./src/configs/env.js";
import pool from "./src/configs/database.js";
import errorHandling from "./src/middleware/error.middleware.js";
import initModels from "./src/models/index.js";
import cookieParser from "cookie-parser";
import employeeAuthRouter from "./src/routes/employeeAuth.route.js";
import testRouter from "./src/routes/test.route.js";
import customerAuthRouter from "./src/routes/customerAuth.route.js";
import bookingRouter from "./src/routes/booking.route.js";
import vehicleRouter from "./src/routes/vehicle.route.js";
import serviceRouter from "./src/routes/service.routes.js";
import { bodyParser } from "./src/middleware/bodyParser.middleware.js";
import employeeRouter from "./src/routes/employee.route.js";
import customerRouter from "./src/routes/customer.route.js";
import paymentRouter from "./src/routes/payment.route.js";
import setupSwagger from "./src/configs/swagger.js";
import corsMiddleware from "./src/middleware/cors.middleware.js";
import {
  generalLimiter,
  authLimiter,
} from "./src/middleware/rateLimit.middleware.js";
const app = express();

// CORS Middleware
app.use(corsMiddleware);

// Rate Limiting
app.use(generalLimiter);

// Middleware
app.use(express.json({ limit: "10mb", strict: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Body parser error handling
app.use(bodyParser);

// Routes
app.use("/api", testRouter);
app.use("/api/authemployee", authLimiter, employeeAuthRouter);
app.use("/api/authcustomer", authLimiter, customerAuthRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/vehicle", vehicleRouter);
app.use("/api/service", serviceRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/customer", customerRouter);
app.use("/api/payment", paymentRouter);

// Error handling Middleware
app.use(errorHandling);

//Swagger Documentation
setupSwagger(app);

// Create Tables
await initModels(pool);

// Server Running
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
