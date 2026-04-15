import React, { useEffect, useState } from "react";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import { Link } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Services
import { getBookings } from "@/services/booking.service";
import { getVehicles } from "@/services/vehicle.service";
import { getMyPayments, getAllPayments } from "@/services/payment.service";
import { useAuth } from "@/contexts/AuthContext";

// New Dashboard Experiences
import CustomerDashboard from "./CustomerDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import AdminDashboard from "./AdminDashboard";

const DashboardPage = () => {
  const { user, isCustomer, isEmployee, isOwner, isCashier } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    bookings: [],
    vehicles: [],
    payments: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Only fetch payments for customers, owners, and cashiers
        const shouldFetchPayments = isCustomer || isOwner || isCashier;

        const [bookingsRes, vehiclesRes, paymentsRes] = await Promise.all([
          getBookings(),
          isCustomer ? getVehicles() : Promise.resolve([]),
          shouldFetchPayments
            ? isCustomer
              ? getMyPayments()
              : getAllPayments()
            : Promise.resolve([]),
        ]);

        setData({
          bookings: bookingsRes || [],
          vehicles: vehiclesRes || [],
          payments: paymentsRes || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCustomer, isOwner, isCashier]);

  // Memoize action button for stable reference in useSetPageHeader
  const headerAction = React.useMemo(
    () =>
      isCustomer ? (
        <Link to="/dashboard/book">
          <Button className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </Link>
      ) : null,
    [isCustomer],
  );

  // Set the dashboard header
  useSetPageHeader(
    "",
    `Welcome back, ${user?.name?.split(" ")[0] || "there"}`,
    "Here's what's happening with your account today.",
    headerAction,
  );

  // Render correct dashboard based on role
  // Owner/Cashier gets Admin dashboard. Customer gets Customer dashboard. Employees get Employee dashboard.
  let DashboardComponent = EmployeeDashboard;
  if (isCustomer) {
    DashboardComponent = CustomerDashboard;
  } else if (isOwner || isCashier) {
    DashboardComponent = AdminDashboard;
  }

  // Pass loading state down so dashboards can render skeletons
  return (
    <div className="w-full">
      <DashboardComponent data={data} loading={loading} />
    </div>
  );
};

export default DashboardPage;
