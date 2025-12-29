import rateLimit from "express-rate-limit";
import { NODE_ENV } from "../configs/env.js";

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => NODE_ENV === "development", // Skip rate limiting in development
});

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/signup attempts per windowMs
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: () => NODE_ENV === "development",
});

// More lenient rate limiter for public routes (like service listing)
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for public routes
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => NODE_ENV === "development",
});
