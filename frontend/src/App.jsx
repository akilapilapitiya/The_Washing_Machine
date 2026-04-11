import React, { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeProtectedRoute from "@/components/EmployeeProtectedRoute";
import CustomerProtectedRoute from "@/components/CustomerProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Booking = lazy(() => import("./pages/Booking"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const Services = lazy(() => import("./pages/Services"));
const Signup = lazy(() => import("./pages/Signup"));
const CustomerLogin = lazy(() => import("./pages/CustomerLogin"));
const EmployeeLogin = lazy(() => import("./pages/EmployeeLogin"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ServiceSelectionPage = lazy(() => import("./features/booking/ServiceSelectionPage"));
const AddonsSelectionPage = lazy(() => import("./features/booking/AddonsSelectionPage"));
const LocationSelectionPage = lazy(() => import("./features/booking/LocationSelectionPage"));
const EmployeeSelectionPage = lazy(() => import("./features/booking/EmployeeSelectionPage"));
const DateTimeSelectionPage = lazy(() => import("./features/booking/DateTimeSelectionPage"));
const BookingConfirmationPage = lazy(() => import("./features/booking/BookingConfirmationPage"));
const ScheduledBookingsPage = lazy(() => import("./features/dashboard/ScheduledBookingsPage"));
const ServiceHistoryPage = lazy(() => import("./features/dashboard/ServiceHistoryPage"));
const PaymentHistoryPage = lazy(() => import("./features/dashboard/PaymentHistoryPage"));
const Feedback = lazy(() => import("./pages/Feedback"));
const ChangePasswordPage = lazy(() => import("./features/auth/ChangePasswordPage"));
const AllBookingsPage = lazy(() => import("./features/admin/AllBookingsPage"));
const ServiceDetailsPage = lazy(() => import("./features/employee/ServiceDetailsPage"));
const PaymentManagementPage = lazy(() => import("./features/employee/PaymentManagementPage"));
const EmployeeManagementPage = lazy(() => import("./features/admin/EmployeeManagementPage"));
const ManageServicesPage = lazy(() => import("./features/admin/ManageServicesPage"));
const ManageCustomersPage = lazy(() => import("./features/admin/ManageCustomersPage"));
const ViewFeedbackPage = lazy(() => import("./features/admin/ViewFeedbackPage"));
const LeaveManagementPage = lazy(() => import("./features/admin/LeaveManagementPage"));
const MyLeavesPage = lazy(() => import("./features/employee/MyLeavesPage"));
const ManageVehicleCatalogPage = lazy(() => import("./features/admin/ManageVehicleCatalogPage"));
const ManageIncidentsPage = lazy(() => import("./features/admin/ManageIncidentsPage"));
const DailyIncomeReportPage = lazy(() => import("./features/admin/DailyIncomeReportPage"));
const AnnualReportPage = lazy(() => import("./features/admin/AnnualReportPage"));
const EmployeePerformanceReportPage = lazy(() => import("./features/admin/EmployeePerformanceReportPage"));
const BookingReviewPage = lazy(() => import("./features/admin/BookingReviewPage"));
const EmployeeIncidentPage = lazy(() => import("./features/employee/EmployeeIncidentPage"));
const ManageAdvertisementsPage = lazy(() => import("./features/admin/ManageAdvertisementsPage"));
const ProfilePage = lazy(() => import("./features/dashboard/ProfilePage"));
const BannedPage = lazy(() => import("./pages/BannedPage"));
import DashboardLayout from "./components/layout/DashboardLayout";
const NotificationsPage = lazy(() => import("./features/dashboard/NotificationsPage"));
const OwnerPricingPage = lazy(() => import("./features/dashboard/OwnerPricingPage"));
const SystemHolidaysPage = lazy(() => import("./features/admin/SystemHolidaysPage"));
const ManageDailySchedulePage = lazy(() => import("./features/admin/ManageDailySchedulePage"));

const ServiceRemindersPage = lazy(() => import("./features/admin/ServiceRemindersPage"));

const ServiceReminderSettingsPage = lazy(() => import("./features/admin/ServiceReminderSettingsPage"));

const MarketplacePage = lazy(() => import("./features/home/MarketplacePage"));

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ScrollToTop />
        <Toaster position="top-right" richColors expand={true} />
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50"><Loader2 className="h-10 w-10 animate-spin text-red-600" /></div>}>
          <Routes>
          {/* Public Routes with Navbar - MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="marketplace" element={<MarketplacePage />} />
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
                <CustomerProtectedRoute>
                  <Booking />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <CustomerProtectedRoute>
                  <ScheduledBookingsPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="history"
              element={
                <CustomerProtectedRoute>
                  <ServiceHistoryPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="payments"
              element={
                <CustomerProtectedRoute>
                  <PaymentHistoryPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="feedback"
              element={
                <CustomerProtectedRoute>
                  <Feedback />
                </CustomerProtectedRoute>
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
                <CustomerProtectedRoute>
                  <Vehicles />
                </CustomerProtectedRoute>
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
                <CustomerProtectedRoute>
                  <ServiceSelectionPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="booking/addons"
              element={
                <CustomerProtectedRoute>
                  <AddonsSelectionPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="booking/location"
              element={
                <CustomerProtectedRoute>
                  <LocationSelectionPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="booking/employee"
              element={
                <CustomerProtectedRoute>
                  <EmployeeSelectionPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="booking/datetime"
              element={
                <CustomerProtectedRoute>
                  <DateTimeSelectionPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="booking/confirmation"
              element={
                <CustomerProtectedRoute>
                  <BookingConfirmationPage />
                </CustomerProtectedRoute>
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
              path="admin/daily-schedule"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner", "cashier"]}>
                  <ManageDailySchedulePage />
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
              path="admin/reports/annual-income"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <AnnualReportPage />
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
            <Route
              path="admin/settings/reminders"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner"]}>
                  <ServiceReminderSettingsPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="admin/reminders"
              element={
                <EmployeeProtectedRoute allowedRoles={["owner", "manager"]}>
                  <ServiceRemindersPage />
                </EmployeeProtectedRoute>
              }
            />
          </Route>
        </Routes>
          </Suspense>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
