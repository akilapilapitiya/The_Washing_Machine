import rateLimit from "express-rate-limit";
import {
  NODE_ENV,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_AUTH_MAX,
} from "../configs/env.js";

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, // Configurable via env (default: 15 minutes)
  max: RATE_LIMIT_MAX_REQUESTS, // Configurable via env (default: 100)
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
  windowMs: RATE_LIMIT_WINDOW_MS, // Configurable via env (default: 15 minutes)
  max: RATE_LIMIT_AUTH_MAX, // Configurable via env (default: 5)
  message: {
    status: "error",
    message:
      "Too many authentication attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: () => NODE_ENV === "development",
});

// More lenient rate limiter for public routes (like service listing)
export const publicLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, // Configurable via env (default: 15 minutes)
  max: RATE_LIMIT_MAX_REQUESTS * 2, // Double the general limit for public routes
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => NODE_ENV === "development",
});
