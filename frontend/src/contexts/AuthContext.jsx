import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployeeMe } from "@/services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer' or 'employee'
  const [emptype, setEmptype] = useState(null); // 'owner', 'manager', or 'employee' (for employees only)
  const [isAdmin, setIsAdmin] = useState(false); // Flag for administrative supremacy
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedUserType = localStorage.getItem("userType");
      const token = localStorage.getItem("token");

      if (token && storedUser && storedUserType) {
        try {
          const raw = JSON.parse(storedUser);

          if (storedUserType === "customer") {
            const normalized = {
              ...raw,
              id: raw.id ?? raw.cusid,
            };
            setUser(normalized);
            setUserType("customer");
            setIsAuthenticated(true);
            setLoading(false);
          } else if (storedUserType === "employee") {
            // STAFF REFRESH: ALWAYS FETCH FROM DB FOR RELIABLE ROLES
            try {
              const response = await getEmployeeMe();
              if (response.success && response.data) {
                const emp = response.data;
                const updated = {
                  id: emp.empid,
                  name: emp.empname,
                  email: emp.email,
                  mobile: emp.emptel,
                  emptype: emp.emptype || emp.rolename || emp.role,
                  isAdmin: !!emp.is_admin || !!emp.isAdmin,
                  profile_picture_url: emp.profile_picture_url,
                };
                setUser(updated);
                setUserType("employee");
                setEmptype(updated.emptype);
                setIsAdmin(updated.isAdmin);
                setIsAuthenticated(true);
                localStorage.setItem("user", JSON.stringify(updated));
                localStorage.setItem("emptype", updated.emptype);
                localStorage.setItem(
                  "isAdmin",
                  updated.isAdmin ? "true" : "false",
                );
              } else {
                throw new Error("Failed to validate staff session");
              }
            } catch (err) {
              console.error("Staff session validation failed:", err);
              // Fallback to stored data if API fails but token exists (optional safety)
              setEmptype(raw.emptype || raw.role || raw.rolename);
              setIsAdmin(
                raw.isAdmin || localStorage.getItem("isAdmin") === "true",
              );
              setUser(raw);
              setUserType("employee");
              setIsAuthenticated(true);
            } finally {
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          logout(); // Clean sweep on error
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, token, type = "customer") => {
    // Normalize user data shape for context-aware UI
    let normalized = userData;
    let employeeType = null;

    if (type === "customer") {
      normalized = {
        id: userData.cusid ?? userData.id,
        firstName: userData.first_name ?? userData.firstName,
        lastName: userData.last_name ?? userData.lastName,
        name: userData.first_name
          ? `${userData.first_name} ${userData.last_name}`.trim()
          : (userData.cusname ?? userData.name),
        email: userData.cusemail ?? userData.email,
        mobile: userData.telephone ?? userData.mobile ?? userData.custel,
        title: userData.title,
        nic: userData.nic,
        dob: userData.dob,
        latitude: userData.latitude ?? null,
        longitude: userData.longitude ?? null,
        profile_picture_url: userData.profile_picture_url,
      };
    } else if (type === "employee") {
      // Extract emptype from employee data (check fallback names from API)
      employeeType = userData.emptype || userData.role || userData.rolename;

      normalized = {
        id: userData.empid ?? userData.id,
        name: userData.empname ?? userData.name,
        email: userData.email,
        mobile: userData.telephone ?? userData.mobile ?? userData.emptel,
        emptype: employeeType, // Store emptype in user object
        isAdmin:
          !!userData.is_admin || !!userData.isAdmin || employeeType === "owner",
        profile_picture_url: userData.profile_picture_url,
      };
    }

    setUser(normalized);
    setUserType(type);
    setEmptype(employeeType); // Set emptype state (null for customers)
    setIsAdmin(normalized.isAdmin || false);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("userType", type);
    localStorage.setItem("token", token);
    localStorage.setItem("isAdmin", normalized.isAdmin ? "true" : "false");

    // Store emptype for employees
    if (employeeType) {
      localStorage.setItem("emptype", employeeType);
    }
  };

  const logout = () => {
    // Capture userType BEFORE clearing state for correct redirection
    const type = userType;

    setUser(null);
    setUserType(null);
    setEmptype(null); // Clear emptype on logout
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("emptype"); // Remove emptype from localStorage
    localStorage.removeItem("token");

    // Redirect based on captured user type
    if (type === "employee") {
      navigate("/employee-login");
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
    emptype, // Employee type: 'owner', 'manager', or 'employee'
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isCustomer: userType === "customer",
    isEmployee: userType === "employee",
    isAdmin, // Direct access to admin flag
    isOwner: userType === "employee" && (emptype === "owner" || isAdmin),
    isCashier:
      userType === "employee" &&
      (emptype === "cashier" || emptype === "owner" || isAdmin),
    isStaff: userType === "employee",
    employeeRole: emptype,
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
