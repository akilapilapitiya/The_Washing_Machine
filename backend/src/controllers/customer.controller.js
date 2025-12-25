import {
  getCustomerService,
  getAllCustomersService,
  updateCustomerService,
  deleteCustomerService,
} from "../services/customer.service.js";

export const getCustomer = async (req, res, next) => {
  try {
    const { cusid } = req.params;
    const customer = await getCustomerService(cusid);

    res.status(200).json({
      status: "success",
      message: "Customer retrieved successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await getAllCustomersService();

    res.status(200).json({
      status: "success",
      message: "Customers retrieved successfully",
      customers,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { cusid } = req.params;
    const updates = req.body;

    const customer = await updateCustomerService(cusid, updates);

    res.status(200).json({
      status: "success",
      message: "Customer updated successfully",
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

    res.status(200).json({
      status: "success",
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
