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

    successResponse(res, 200, "Customers retrieved successfully", { customers });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { cusid } = req.params;
    const { name, email, telephone } = req.body;

    // Map request fields to database field names
    const updates = {
      cusname: name,
      cusemail: email,
      custel: telephone,
    };

    const customer = await updateCustomerService(cusid, updates);

    successResponse(res, 200, "Customer updated successfully", { customer });
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
