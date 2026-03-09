import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeProtectedRoute from "@/components/EmployeeProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
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
import ManageVehicleCatalogPage from "./features/admin/ManageVehicleCatalogPage";
import ManageIncidentsPage from "./features/admin/ManageIncidentsPage";
import DailyIncomeReportPage from "./features/admin/DailyIncomeReportPage";
import EmployeePerformanceReportPage from "./features/admin/EmployeePerformanceReportPage";
import BookingReviewPage from "./features/admin/BookingReviewPage";
import EmployeeIncidentPage from "./features/employee/EmployeeIncidentPage";
import ManageAdvertisementsPage from "./features/admin/ManageAdvertisementsPage";
import ProfilePage from "./features/dashboard/ProfilePage";
import BannedPage from "./pages/BannedPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotificationsPage from "./features/dashboard/NotificationsPage";
import OwnerPricingPage from "./features/dashboard/OwnerPricingPage";
import SystemHolidaysPage from "./features/admin/SystemHolidaysPage";

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ScrollToTop />
        <Toaster position="top-right" richColors expand={true} />
        <Routes>
          {/* Public Routes with Navbar - MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Auth Routes — No Navbar, clean layout */}
          <Route element={<AuthLayout />}>
            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<CustomerLogin />} />
            <Route path="employee-login" element={<EmployeeLogin />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="banned" element={<BannedPage />} />
          </Route>

          {/* Dashboard Routes - Independent Layout */}
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
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
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
              path="employee/incidents"
              element={
                <EmployeeProtectedRoute allowedRoles={["employee", "cashier"]}>
                  <EmployeeIncidentPage />
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
              path="admin/holidays"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <SystemHolidaysPage />
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
            <Route
              path="admin/vehicle-catalog"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <ManageVehicleCatalogPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/incidents"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <ManageIncidentsPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/advertisements"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <ManageAdvertisementsPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/reports/daily-income"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <DailyIncomeReportPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/reports/employee-performance"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <EmployeePerformanceReportPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/bookings"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner", "cashier"]}>
                  <BookingReviewPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/settings/pricing"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <OwnerPricingPage />
                </EmployeeProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
