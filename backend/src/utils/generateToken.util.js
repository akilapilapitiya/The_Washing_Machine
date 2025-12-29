import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../configs/env.js";

export const generateToken = (id, role, emptype = null) => {
  const payload = { id, role };
  
  // Include emptype in token for employee roles
  if (emptype) {
    payload.emptype = emptype;
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
