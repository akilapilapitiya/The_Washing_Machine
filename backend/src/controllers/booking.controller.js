import {
  createBookingService,
  updateBookingService,
  deleteBookingService,
  getAllBookingsService,
  getBookingService,
  resolveBookingEmployeeService,
  rescheduleBookingService,
} from "../services/booking.service.js";
import { successResponse } from "../utils/response.util.js";

// GET All Bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const bookings = await getAllBookingsService(userId, userRole, userEmptype);

    successResponse(res, 200, "Bookings retrieved successfully", { bookings });
  } catch (error) {
    next(error);
  }
};

// GET Booking by ID
export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const booking = await getBookingService(id, userId, userRole, userEmptype);

    successResponse(res, 200, "Booking retrieved successfully", { booking });
  } catch (error) {
    next(error);
  }
};

// CREATE Booking
export const createBooking = async (req, res, next) => {
  try {
    const customerId = req.user.id; // from auth middleware
    const userRole = req.user.role; // from auth middleware
    const {
      status,
      date,
      startTime,
      locationLatitude,
      locationLongitude,
      vehicleId,
      services, // array of service IDs
      employeeId,
      locationType,
      travelDistance,
      travelDuration,
    } = req.body;

    const booking = await createBookingService({
      customerId,
      status,
      date,
      startTime,
      locationLatitude,
      locationLongitude,
      locationType,
      vehicleId,
      services,
      userRole,
      employeeId,
      travelDistance,
      travelDuration,
    });

    successResponse(res, 201, "Booking created successfully", { booking });
  } catch (error) {
    next(error);
  }
};

// Resolve Booking Employee
export const resolveBookingEmployee = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const userRole = req.user.role;
    const { vehicleId, services, locationType } = req.body;

    const assignment = await resolveBookingEmployeeService({
      customerId,
      userRole,
      vehicleId,
      services,
      locationType,
    });

    successResponse(res, 200, "Employee assigned successfully", { assignment });
  } catch (error) {
    next(error);
  }
};

// UPDATE Booking
export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const booking = await updateBookingService(
      id,
      updates,
      userId,
      userRole,
      userEmptype,
    );

    successResponse(res, 200, "Booking updated successfully", { booking });
  } catch (error) {
    next(error);
  }
};

// DELETE Booking
export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    await deleteBookingService(id, userId, userRole, userEmptype);

    successResponse(res, 200, "Booking deleted successfully");
  } catch (error) {
    next(error);
  }
};

// Reschedule Booking (admin)
export const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime } = req.body;
    const adminId = req.user.id;

    if (!newDate || !newStartTime) {
      throw new Error("Date and Time are required for rescheduling");
    }

    await rescheduleBookingService(id, newDate, newStartTime, adminId);
    successResponse(res, 200, "Service rescheduled successfully");
  } catch (error) {
    next(error);
  }
};
