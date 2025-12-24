import jwt from "jsonwebtoken"
import { JWT_EXPIRES_IN, JWT_SECRET } from "../configs/env.js";

export const generateToken = (userId) =>{
    const payLoad = {id: userId };
    const token = jwt.sign(payLoad, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
    return token;
}

