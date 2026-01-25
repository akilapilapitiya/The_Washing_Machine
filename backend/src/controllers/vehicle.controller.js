import {
  createVehicleService,
  getCustomerVehiclesService,
  getVehicleService,
  getAllVehiclesByRoleService,
  updateVehicleService,
  deleteVehicleService,
} from "../services/vehicle.service.js";
import { successResponse } from "../utils/response.util.js";

export const createVehicle = async (req, res, next) => {
  try {
    const customerId = req.user.id; // from auth middleware
    const { vehplate, vehmileage, vehbrand, vehmodel } = req.body;

    const vehicle = await createVehicleService({
      customerId,
      vehplate,
      vehmileage,
      vehbrand,
      vehmodel,
    });

    successResponse(res, 201, "Vehicle created successfully", { vehicle });
  } catch (error) {
    next(error);
  }
};

export const getCustomerVehicles = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const vehicles = await getAllVehiclesByRoleService(
      userId,
      userRole,
      userEmptype
    );

    successResponse(res, 200, "Vehicles retrieved successfully", { vehicles });
  } catch (error) {
    next(error);
  }
};

export const getVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const vehicle = await getVehicleService(
      id,
      userId,
      userRole,
      userEmptype
    );

    successResponse(res, 200, "Vehicle retrieved successfully", { vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vehmileage } = req.body;

    const vehicle = await updateVehicleService(id, vehmileage);

    successResponse(res, 200, "Vehicle mileage updated successfully", {
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

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
