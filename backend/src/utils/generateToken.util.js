import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../configs/env.js";

export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
