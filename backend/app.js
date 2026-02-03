import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { PORT } from "./src/configs/env.js";
import pool from "./src/configs/database.js";
import { bodyParser } from "./src/middleware/bodyParser.middleware.js";
import compressionConfig from "./src/middleware/compression.middleware.js";
import corsMiddleware from "./src/middleware/cors.middleware.js";
import errorHandling from "./src/middleware/error.middleware.js";
import helmetConfig from "./src/middleware/helmet.middleware.js";
import {
  authLimiter,
  generalLimiter,
} from "./src/middleware/rateLimit.middleware.js";
import bookingRouter from "./src/routes/booking.route.js";
import customerAuthRouter from "./src/routes/customerAuth.route.js";
import customerRouter from "./src/routes/customer.route.js";
import employeeAuthRouter from "./src/routes/employeeAuth.route.js";
import employeeRouter from "./src/routes/employee.route.js";
import feedbackRouter from "./src/routes/feedback.route.js";
import paymentRouter from "./src/routes/payment.route.js";
import serviceRouter from "./src/routes/service.routes.js";
import testRouter from "./src/routes/test.route.js";
import vehicleRouter from "./src/routes/vehicle.route.js";
import leaveRouter from "./src/routes/employeeLeave.route.js";
import scheduleRouter from "./src/routes/schedule.route.js";
import catalogRouter from "./src/routes/vehicleCatalog.route.js";
import incidentRouter from "./src/routes/incident.route.js";
import reportRouter from "./src/routes/report.route.js";
import notificationRouter from "./src/routes/notification.route.js";
import dependentRouter from "./src/routes/dependent.route.js";
import setupSwagger from "./src/configs/swagger.js";
import initModels from "./src/models/index.js";

const createApp = () => {
  const app = express();

  // CORS Middleware
  app.use(corsMiddleware);

  // Security Headers Middleware
  app.use(helmetConfig);

  // Response Compression Middleware
  app.use(compressionConfig);

  // Rate Limiting
  // app.use(generalLimiter);

  // Core Middleware
  app.use(express.json({ limit: "10mb", strict: false }));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Static files serving
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
  app.use("/api/feedback", feedbackRouter);
  app.use("/api/leave", leaveRouter);
  app.use("/api/schedule", scheduleRouter);
  app.use("/api/vehicle-catalog", catalogRouter);
  app.use("/api/incident", incidentRouter);
  app.use("/api/report", reportRouter);
  app.use("/api/notification", notificationRouter);
  app.use("/api/dependent", dependentRouter);

  // Error handling Middleware
  app.use(errorHandling);

  // Swagger Documentation
  setupSwagger(app);

  return app;
};

const app = createApp();

if (process.env.NODE_ENV !== "test") {
  await initModels(pool);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export { createApp };
export default app;
