import { Router } from "express";
import {
  createBooking,
  deleteBooking,
  updateBooking,
  getAllBookings,
  getBooking,
  resolveBookingEmployee,
  rescheduleBooking,
} from "../controllers/booking.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { bookingValidator } from "../validators/index.js";

const bookingRouter = Router();

// Protected routes
bookingRouter.use(authMiddleware);

bookingRouter.get("/", restrictTo("customer", "employee"), getAllBookings);

bookingRouter.get("/:id", restrictTo("customer", "employee"), getBooking);

bookingRouter.post(
  "/resolve-employee",
  restrictTo("customer", "employee"),
  validateSchema(bookingValidator.resolveEmployee),
  resolveBookingEmployee,
);

bookingRouter.post(
  "/",
  restrictTo("customer", "employee"),
  validateSchema(bookingValidator.createBooking),
  createBooking,
);
bookingRouter.put(
  "/:id",
  restrictTo("customer", "employee"),
  validateSchema(bookingValidator.updateBooking),
  updateBooking,
);
bookingRouter.delete("/:id", restrictTo("customer", "employee"), deleteBooking);

bookingRouter.put(
  "/:id/reschedule",
  restrictTo("owner", "cashier"),
  rescheduleBooking,
);

export default bookingRouter;
