import {
  createServiceService,
  getAllServicesService,
  getServiceService,
  updateServiceService,
  deleteServiceService,
} from "../services/service.service.js";

export const createService = async (req, res, next) => {
  try {
    const { servicename, servicetime, serviceprice, servicedetails } = req.body;

    const service = await createServiceService({
      servicename,
      servicetime,
      serviceprice,
      servicedetails,
    });

    res.status(201).json({
      status: "success",
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllServices = async (req, res, next) => {
  try {
    const services = await getAllServicesService();

    res.status(200).json({
      status: "success",
      message: "Services retrieved successfully",
      services,
    });
  } catch (error) {
    next(error);
  }
};

export const getService = async (req, res, next) => {
  try {
    const { serviceid } = req.params;

    const service = await getServiceService(serviceid);

    res.status(200).json({
      status: "success",
      message: "Service retrieved successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { serviceid } = req.params;
    const updates = req.body;

    const service = await updateServiceService(serviceid, updates);

    res.status(200).json({
      status: "success",
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { serviceid } = req.params;

    await deleteServiceService(serviceid);

    res.status(200).json({
      status: "success",
      message: "Service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
