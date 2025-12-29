import {
  createVehicleService,
  getCustomerVehiclesService,
  getVehicleService,
  getAllVehiclesByRoleService,
  updateVehicleService,
  deleteVehicleService,
} from "../services/vehicle.service.js";

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

    res.status(201).json({
      status: "success",
      message: "Vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerVehicles = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const vehicles = await getAllVehiclesByRoleService(userId, userRole, userEmptype);

    res.status(200).json({
      status: "success",
      message: "Vehicles retrieved successfully",
      vehicles,
    });
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

    const vehicle = await getVehicleService(vehid, userId, userRole, userEmptype);

    res.status(200).json({
      status: "success",
      message: "Vehicle retrieved successfully",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const customerId = req.user.id; // from auth middleware
    const { vehid } = req.params;
    const updates = req.body;

    const vehicle = await updateVehicleService(vehid, customerId, updates);

    res.status(200).json({
      status: "success",
      message: "Vehicle updated successfully",
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

    res.status(200).json({
      status: "success",
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
