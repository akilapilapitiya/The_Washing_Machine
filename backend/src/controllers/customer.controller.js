import {
  getCustomerService,
  getAllCustomersService,
  updateCustomerService,
  deleteCustomerService,
} from "../services/customer.service.js";
import { successResponse } from "../utils/response.util.js";

export const getCustomer = async (req, res, next) => {
  try {
    const { cusid } = req.params;
    const customer = await getCustomerService(cusid);

    successResponse(res, 200, "Customer retrieved successfully", { customer });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await getAllCustomersService();

    successResponse(res, 200, "Customers retrieved successfully", {
      customers,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { cusid } = req.params;
    const {
      title,
      firstName,
      lastName,
      email,
      telephone,
      nic,
      dob,
      latitude,
      longitude,
      profile_picture_url,
    } = req.body;

    // Map request fields to database field names
    const updates = {
      title,
      first_name: firstName,
      last_name: lastName,
      cusemail: email,
      custel: telephone,
      nic,
      dob,
      latitude,
      longitude,
      profile_picture_url,
    };

    // Remove undefined fields to avoid overwriting with null
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key],
    );

    const customer = await updateCustomerService(cusid, updates);

    successResponse(res, 200, "Customer updated successfully", { customer });
  } catch (error) {
    next(error);
  }
};

export const updateProfilePicture = async (req, res, next) => {
  try {
    const { cusid } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const profile_picture_url = `/uploads/profiles/${req.file.filename}`;
    const customer = await updateCustomerService(cusid, {
      profile_picture_url,
    });

    successResponse(res, 200, "Profile picture updated successfully", {
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const { cusid } = req.params;
    await deleteCustomerService(cusid);

    successResponse(res, 200, "Customer deleted successfully");
  } catch (error) {
    next(error);
  }
};
