import { Router } from "express";
import { databaseConnection } from "../controllers/test.controller.js";

const testRouter = Router();

testRouter.get("/db", databaseConnection);

export default testRouter;
