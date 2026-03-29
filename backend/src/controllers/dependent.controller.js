import * as dependentService from "../services/dependent.service.js";
import { successResponse } from "../utils/response.util.js";

// GET My Dependents
export const getMyDependents = async (req, res, next) => {
  try {
    const dependents = await dependentService.getMyDependentsService(
      req.user.id,
    );
    successResponse(res, 200, "Dependents retrieved successfully", dependents);
  } catch (error) {
    next(error);
  }
};

// CREATE Dependent
export const createDependent = async (req, res, next) => {
  try {
    const dependent = await dependentService.addDependentService(
      req.user.id,
      req.body,
    );
    successResponse(res, 201, "Dependent added successfully", dependent);
  } catch (error) {
    next(error);
  }
};

// UPDATE Dependent
export const removeDependent = async (req, res, next) => {
  try {
    await dependentService.removeDependentService(req.params.id, req.user.id);
    successResponse(res, 200, "Dependent removed successfully");
  } catch (error) {
    next(error);
  }
};
