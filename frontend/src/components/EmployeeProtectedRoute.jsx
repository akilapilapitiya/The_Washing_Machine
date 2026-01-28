import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const EmployeeProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isStaff, emptype, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to employee login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/employee/login" replace />;
  }

  // Redirect to employee login if authenticated but not staff
  if (!isStaff) {
    return <Navigate to="/employee/login" replace />;
  }

  // Check for specific role requirements if provided
  if (allowedRoles && !allowedRoles.includes(emptype)) {
    // If user is owner, they pass regardless!
    if (emptype === "owner") return children;

    // Otherwise, redirect to general dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Render protected content
  return children;
};

export default EmployeeProtectedRoute;
