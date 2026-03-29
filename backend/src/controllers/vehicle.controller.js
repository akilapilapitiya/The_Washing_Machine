import {
  createVehicleService,
  getCustomerVehiclesService,
  getVehicleService,
  getAllVehiclesByRoleService,
  updateVehicleService,
  deleteVehicleService,
  recordServiceSnapshotService,
} from "../services/vehicle.service.js";
import { successResponse } from "../utils/response.util.js";

// CREATE Vehicle
export const createVehicle = async (req, res, next) => {
  try {
    const customerId = req.user.id; // from auth middleware
    const {
      vehplate,
      vehmileage,
      vehbrand,
      vehmodel,
      fuel_type,
      vehcolor,
      manufacture_year,
      transmission,
      engine_capacity,
    } = req.body;

    const vehicle = await createVehicleService({
      customerId,
      vehplate,
      vehmileage,
      vehbrand,
      vehmodel,
      fuel_type,
      vehcolor,
      manufacture_year,
      transmission,
      engine_capacity,
      next_service_mileage: 0, // Automated behind the scenes as per user request
    });

    successResponse(res, 201, "Vehicle created successfully", { vehicle });
  } catch (error) {
    next(error);
  }
};

// GET All Vehicles for Customer
export const getCustomerVehicles = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const vehicles = await getAllVehiclesByRoleService(
      userId,
      userRole,
      userEmptype,
    );

    successResponse(res, 200, "Vehicles retrieved successfully", { vehicles });
  } catch (error) {
    next(error);
  }
};

// GET Vehicle by ID
export const getVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const vehicle = await getVehicleService(id, userId, userRole, userEmptype);

    successResponse(res, 200, "Vehicle retrieved successfully", { vehicle });
  } catch (error) {
    next(error);
  }
};

// UPDATE Vehicle
export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const vehicle = await updateVehicleService(id, updates);

    successResponse(res, 200, "Vehicle updated successfully", {
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Vehicle
export const deleteVehicle = async (req, res, next) => {
  try {
    const customerId = req.user.id; // from auth middleware
    const { id } = req.params;

    await deleteVehicleService(id, customerId);

    successResponse(res, 200, "Vehicle deleted successfully");
  } catch (error) {
    next(error);
  }
};

// RECORD Service Snapshot (on booking completion)
export const recordServiceSnapshot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentMileage, nextServiceMileage, bookingId, isMaintenance } = req.body;

    console.log("[DEBUG] Service Snapshot Request:", {
      vehicleId: id,
      currentMileage,
      nextServiceMileage,
      bookingId,
      isMaintenance,
      bodyRaw: req.body,
    });

    const vehicle = await recordServiceSnapshotService(id, {
      currentMileage: Number(currentMileage),
      nextServiceMileage: Number(nextServiceMileage),
      bookingId: bookingId ? Number(bookingId) : null,
      isMaintenance: Boolean(isMaintenance),
    });

    successResponse(res, 200, "Service snapshot recorded successfully", {
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};
