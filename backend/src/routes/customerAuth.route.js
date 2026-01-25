import { Router } from "express";
import {
  customerSignIn,
  customerSignOut,
  customerSignUp,
  passwordReset,
} from "../controllers/customerAuth.controller.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { customerValidator } from "../validators/index.js";

const customerAuthRouter = Router();

customerAuthRouter.post(
  "/signup",
  validateSchema(customerValidator.createCustomer),
  customerSignUp
);
customerAuthRouter.post(
  "/signin",
  validateSchema(customerValidator.loginCustomer),
  customerSignIn
);
customerAuthRouter.post("/signout", customerSignOut);
customerAuthRouter.put("/passwordreset", passwordReset);
export default customerAuthRouter;
