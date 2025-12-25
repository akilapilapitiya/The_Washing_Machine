import {
  createBookingService,
  updateBookingService,
  deleteBookingService,
  getAllBookingsService,
  getBookingService,
} from "../services/booking.service.js";

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await getAllBookingsService();

    res.status(200).json({
      status: "success",
      message: "Bookings retrieved successfully",
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await getBookingService(id);

    res.status(200).json({
      status: "success",
      message: "Booking retrieved successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const customerId = req.user.id; // from auth middleware
    const userRole = req.user.role; // from auth middleware
    const {
      status,
      date,
      startTime,
      endTime,
      locationLatitude,
      locationLongitude,
      vehicleId,
      services, // array of service IDs
    } = req.body;

    const booking = await createBookingService({
      customerId,
      status,
      date,
      startTime,
      endTime,
      locationLatitude,
      locationLongitude,
      vehicleId,
      services,
      userRole,
    });

    res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await updateBookingService(id, updates);

    res.status(200).json({
      status: "success",
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteBookingService(id);

    res.status(200).json({
      status: "success",
      message: "Booking deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
