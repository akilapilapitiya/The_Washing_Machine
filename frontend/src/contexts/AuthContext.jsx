import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer' or 'employee'
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const storedUser = localStorage.getItem("user");
      const storedUserType = localStorage.getItem("userType");
      const token = localStorage.getItem("token");

      if (storedUser && token && storedUserType) {
        try {
          setUser(JSON.parse(storedUser));
          setUserType(storedUserType);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("userType");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, token, type = "customer") => {
    setUser(userData);
    setUserType(type);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userType", type);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
    
    // Redirect based on user type
    if (userType === "employee") {
      navigate("/employee/login");
    } else {
      navigate("/login");
    }
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    userType,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isCustomer: userType === "customer",
    isEmployee: userType === "employee",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
