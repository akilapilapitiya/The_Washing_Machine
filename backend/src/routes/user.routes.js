import { Router } from "express";

const userRouter = Router();

userRouter.get("/user", getAllUsers);
userRouter.get("/user/:id", getUser);
userRouter.post("/user/:id", createUser);
userRouter.update("/user/:id", updateUser);
userRouter.delete("/user/:id", deleteUser);

export default userRouter;
