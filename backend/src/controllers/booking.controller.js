import {createBookingService, updateBookingService, deleteBookingService} from "../services/booking.service.js";
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
      services // array of service IDs
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
      userRole
    });

    res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const updates = req.body;

    const booking = await updateBookingService(bookingId, updates);

    res.status(200).json({
      status: "success",
      message: "Booking updated successfully",
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    await deleteBookingService(bookingId);

    res.status(200).json({
      status: "success",
      message: "Booking deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
