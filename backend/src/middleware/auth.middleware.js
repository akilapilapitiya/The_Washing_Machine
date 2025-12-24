import { JWT_SECRET } from "../configs/env.js";
import jwt from "jsonwebtoken";
import pool from "../configs/database.js";

export const authMiddleware = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  if (!token) {
    return res.status(401).json({
      error: "Not authorized. No valid token provided."
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info with role to request
    req.user = {
      id: decoded.id,
      role: decoded.role // 'customer' or 'employee'
    };
    
    // Optionally verify user still exists in database
    let userExists;
    if (decoded.role === 'customer') {
      const result = await pool.query("SELECT cusid FROM customer WHERE cusid = $1", [decoded.id]);
      userExists = result.rowCount > 0;
    } else if (decoded.role === 'employee') {
      const result = await pool.query("SELECT empid FROM employee WHERE empid = $1", [decoded.id]);
      userExists = result.rowCount > 0;
    }
    
    if (!userExists) {
      return res.status(401).json({
        error: "User no longer exists."
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Not authorized. Invalid token."
    });
  }
};

// Middleware to restrict access to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "You do not have permission to perform this action."
      });
    }
    next();
  };
};