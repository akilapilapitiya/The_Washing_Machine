import React from "react";
import { Routes, Route } from "react-router-dom";
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
import AllBookingsPage from "./features/admin/AllBookingsPage";
import ServiceDetailsPage from "./features/employee/ServiceDetailsPage";
import PaymentManagementPage from "./features/employee/PaymentManagementPage";
import EmployeeManagementPage from "./features/admin/EmployeeManagementPage";
import ManageServicesPage from "./features/admin/ManageServicesPage";
import ManageCustomersPage from "./features/admin/ManageCustomersPage";
import ViewFeedbackPage from "./features/admin/ViewFeedbackPage";
import LeaveManagementPage from "./features/admin/LeaveManagementPage";
import MyLeavesPage from "./features/employee/MyLeavesPage";
import ProfilePage from "./features/dashboard/ProfilePage";
import DashboardLayout from "./components/layout/DashboardLayout";

const App = () => {
  return (
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

          {/* Dashboard Routes with Sidebar */}
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="book"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <ScheduledBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="history"
              element={
                <ProtectedRoute>
                  <ServiceHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="payments"
              element={
                <ProtectedRoute>
                  <PaymentHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="vehicles"
              element={
                <ProtectedRoute>
                  <Vehicles />
                </ProtectedRoute>
              }
            />

            {/* Booking Flow Selection Steps */}
            <Route
              path="booking/services"
              element={
                <ProtectedRoute>
                  <ServiceSelectionPage />
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

            {/* Employee Dashboard Routes */}
            <Route
              path="employee/assigned"
              element={
                <EmployeeProtectedRoute
                  allowedRoles={["owner", "employee", "cashier"]}
                >
                  <AllBookingsPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="employee/service/:id"
              element={
                <EmployeeProtectedRoute
                  allowedRoles={["owner", "employee", "cashier"]}
                >
                  <ServiceDetailsPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="employee/payments"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner", "cashier"]}>
                  <PaymentManagementPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="employee/leaves"
              element={
                <EmployeeProtectedRoute
                  allowedRoles={["owner", "employee", "cashier"]}
                >
                  <MyLeavesPage />
                </EmployeeProtectedRoute>
              }
            />

            {/* Admin Dashboard Routes */}
            <Route
              path="admin/employees"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <EmployeeManagementPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/attendance"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <LeaveManagementPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/services"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <ManageServicesPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/customers"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner", "cashier"]}>
                  <ManageCustomersPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/feedback"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <ViewFeedbackPage />
                </EmployeeProtectedRoute>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
