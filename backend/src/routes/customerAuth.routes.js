import { Router } from "express";
import { customerSignIn, customerSignOut, customerSignUp } from "../controllers/customerAuth.controller.js";

const customerAuthRouter = Router();

customerAuthRouter.post("/signup", customerSignUp);
customerAuthRouter.post("/signin", customerSignIn);
customerAuthRouter.post("/signout", customerSignOut);

export default customerAuthRouter;
