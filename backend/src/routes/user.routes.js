import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import validateUser from "../middleware/inputValidator.js";

const userRouter = Router();

userRouter.get("/user", getAllUsers);
userRouter.get("/user/:id", getUserById);
userRouter.post("/user", validateUser, createUser);
userRouter.put("/user/:id", validateUser, updateUser);
userRouter.delete("/user/:id", deleteUser);
export default userRouter;
