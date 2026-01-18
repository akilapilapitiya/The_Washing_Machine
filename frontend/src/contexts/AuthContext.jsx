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
          const raw = JSON.parse(storedUser);
          // Normalize stored user to common shape
          let normalized = raw;
          if (storedUserType === "customer") {
            normalized = {
              id: raw.cusid ?? raw.id,
              name: raw.cusname ?? raw.name,
              email: raw.cusemail ?? raw.email,
              mobile: raw.telephone ?? raw.mobile ?? raw.custel,
            };
          } else if (storedUserType === "employee") {
            normalized = {
              id: raw.empid ?? raw.id,
              name: raw.empname ?? raw.name,
              email: raw.email,
              mobile: raw.telephone ?? raw.mobile ?? raw.emptel,
            };
          }
          setUser(normalized);
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
    // Normalize user data shape for context-aware UI
    let normalized = userData;
    if (type === "customer") {
      normalized = {
        id: userData.cusid ?? userData.id,
        name: userData.cusname ?? userData.name,
        email: userData.cusemail ?? userData.email,
              mobile: userData.telephone ?? userData.mobile ?? userData.custel,
      };
    } else if (type === "employee") {
      normalized = {
        id: userData.empid ?? userData.id,
        name: userData.empname ?? userData.name,
        email: userData.email,
              mobile: userData.telephone ?? userData.mobile ?? userData.emptel,
      };
    }

    setUser(normalized);
    setUserType(type);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(normalized));
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
