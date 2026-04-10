import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "./common/LoadingStates";

/**
 * A wrapper for routes that should only be accessible by customers.
 * If the user is staff (employee, owner, manager, etc.), they will be redirected to the root dashboard.
 * If the user is not authenticated, they will be redirected to the login page.
 */
const CustomerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isCustomer } = useAuth();

  if (loading) {
    return <PageLoader message="Validating credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect staff users to their respective dashboards if they try to access customer pages
  if (!isCustomer) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default CustomerProtectedRoute;
