import { Router } from "express";
import {
  customerSignIn,
  customerSignOut,
  customerSignUp,
  passwordReset,
} from "../controllers/customerAuth.controller.js";

const customerAuthRouter = Router();

customerAuthRouter.post("/signup", customerSignUp);
customerAuthRouter.post("/signin", customerSignIn);
customerAuthRouter.post("/signout", customerSignOut);
customerAuthRouter.put("/passwordreset", passwordReset)
export default customerAuthRouter;
