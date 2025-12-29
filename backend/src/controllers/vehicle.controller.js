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
    const { vehid, vehmileage, vehbrand, vehmodel } = req.body;

    const vehicle = await createVehicleService({
      customerId,
      vehid,
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
    const { vehid } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const vehicle = await getVehicleService(
      vehid,
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
    const { vehid } = req.params;
    const { vehmileage } = req.body;

    const vehicle = await updateVehicleService(vehid, vehmileage);

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
    const { vehid } = req.params;

    await deleteVehicleService(vehid, customerId);

    successResponse(res, 200, "Vehicle deleted successfully");
  } catch (error) {
    next(error);
  }
};
