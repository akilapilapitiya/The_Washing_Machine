import { Router } from "express";
import * as dependentController from "../controllers/dependent.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { dependentValidator } from "../validators/index.js";

const router = Router();

// Protected routes
router.use(authMiddleware);
router.use(restrictTo("employee", "manager", "owner", "cashier"));

router.get("/me", dependentController.getMyDependents);

router.post(
  "/",
  validateSchema(dependentValidator.createDependent),
  dependentController.createDependent,
);

router.delete("/:id", dependentController.removeDependent);

export default router;
