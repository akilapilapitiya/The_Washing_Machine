import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeProtectedRoute from "@/components/EmployeeProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import Vehicles from "./pages/Vehicles";
import Services from "./pages/Services";
import Signup from "./pages/Signup";
import CustomerLogin from "./pages/CustomerLogin";
import EmployeeLogin from "./pages/EmployeeLogin";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import ServiceSelectionPage from "./features/booking/ServiceSelectionPage";
import LocationSelectionPage from "./features/booking/LocationSelectionPage";
import EmployeeSelectionPage from "./features/booking/EmployeeSelectionPage";
import DateTimeSelectionPage from "./features/booking/DateTimeSelectionPage";
import BookingConfirmationPage from "./features/booking/BookingConfirmationPage";
import ScheduledBookingsPage from "./features/dashboard/ScheduledBookingsPage";
import ServiceHistoryPage from "./features/dashboard/ServiceHistoryPage";
import PaymentHistoryPage from "./features/dashboard/PaymentHistoryPage";
import Feedback from "./pages/Feedback";
import ChangePasswordPage from "./features/auth/ChangePasswordPage";
import AssignedServicesPage from "./features/employee/AssignedServicesPage";
import ServiceDetailsPage from "./features/employee/ServiceDetailsPage";
import PaymentManagementPage from "./features/employee/PaymentManagementPage";
import EmployeeManagementPage from "./features/admin/EmployeeManagementPage";
import ManageServicesPage from "./features/admin/ManageServicesPage";
import ManageCustomersPage from "./features/admin/ManageCustomersPage";
import ProfilePage from "./features/dashboard/ProfilePage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<CustomerLogin />} />
            <Route path="employee/login" element={<EmployeeLogin />} />
            <Route path="forgot-password" element={<ForgotPassword />} />

            {/* Protected Customer Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/book"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            <Route
              path="booking/location"
              element={
                <ProtectedRoute>
                  <LocationSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="booking/services"
              element={
                <ProtectedRoute>
                  <ServiceSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="booking/employee"
              element={
                <ProtectedRoute>
                  <EmployeeSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="booking/datetime"
              element={
                <ProtectedRoute>
                  <DateTimeSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="booking/confirmation"
              element={
                <ProtectedRoute>
                  <BookingConfirmationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/bookings"
              element={
                <ProtectedRoute>
                  <ScheduledBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/history"
              element={
                <ProtectedRoute>
                  <ServiceHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/payments"
              element={
                <ProtectedRoute>
                  <PaymentHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/employee/assigned"
              element={
                <EmployeeProtectedRoute>
                  <AssignedServicesPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="dashboard/employee/service/:id"
              element={
                <EmployeeProtectedRoute>
                  <ServiceDetailsPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="dashboard/employee/payments"
              element={
                <EmployeeProtectedRoute>
                  <PaymentManagementPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="dashboard/admin/employees"
              element={
                <EmployeeProtectedRoute>
                  <EmployeeManagementPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="dashboard/admin/services"
              element={
                <EmployeeProtectedRoute>
                  <ManageServicesPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="dashboard/admin/customers"
              element={
                <EmployeeProtectedRoute>
                  <ManageCustomersPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="dashboard/vehicles"
              element={
                <ProtectedRoute>
                  <Vehicles />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
