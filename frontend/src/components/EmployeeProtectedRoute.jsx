import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const EmployeeProtectedRoute = ({ children }) => {
  const { isAuthenticated, isEmployee, loading } = useAuth();

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

  // Redirect to employee login if authenticated but not an employee
  if (!isEmployee) {
    return <Navigate to="/employee/login" replace />;
  }

  // Render protected content
  return children;
};

export default EmployeeProtectedRoute;
