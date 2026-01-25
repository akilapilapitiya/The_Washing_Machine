import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Clock,
  CreditCard,
  Settings,
  Users,
  Wrench,
  CheckCircle2,
  AlertCircle,
  History,
  Car,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/lib/colors";
import { getBookings } from "@/services/booking.service";
import { getVehicles } from "@/services/vehicle.service";
import { getMyPayments, getAllPayments } from "@/services/payment.service";

const MetricCard = ({ title, value, icon: Icon, description, loading }) => (
  <Card className="border-gray-200 shadow-sm overflow-hidden min-h-[120px]">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1"></div>
          ) : (
            <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
          )}
          {description && !loading && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${COLORS.bg.brandLight} border border-red-100 ml-4`}
        >
          <Icon className={`h-6 w-6 ${COLORS.text.brand}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const QuickAction = ({ title, description, to, icon: Icon, primary }) => (
  <Link to={to} className="group">
    <Card
      className={`h-full border-gray-200 transition-all hover:border-red-200 hover:shadow-md ${
        primary ? "bg-white border-red-100" : "bg-white"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded ${
              primary ? COLORS.bg.brand : COLORS.bg.brandLight
            } ${primary ? "text-white" : COLORS.text.brand} transition-colors`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-semibold group-hover:text-red-600 transition-colors">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

const DashboardPage = () => {
  const { user, isCustomer, isEmployee } = useAuth();
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
        const [bookingsRes, vehiclesRes, paymentsRes] = await Promise.all([
          getBookings(),
          isCustomer ? getVehicles() : Promise.resolve([]),
          isCustomer ? getMyPayments() : getAllPayments(),
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
  }, [isCustomer]);

  // Derived metrics
  const totalBookings = data.bookings.length;
  const totalVehicles = data.vehicles.length;
  const totalAmount = data.payments.reduce(
    (sum, p) => sum + (p.paymentamount || 0),
    0,
  );

  const upcomingBooking = data.bookings
    .filter((b) => b.status === "confirmed" || b.status === "pending")
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const assignedJobs = data.bookings.filter(
    (b) => b.status === "confirmed" || b.status === "in-progress",
  ).length;

  const completedJobs = data.bookings.filter(
    (b) => b.status === "completed",
  ).length;

  const customerMetrics = [
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      icon: Calendar,
      description: "Scheduled services",
    },
    {
      title: "Upcoming",
      value: upcomingBooking
        ? new Date(upcomingBooking.date).toLocaleDateString()
        : "None",
      icon: Clock,
      description: upcomingBooking
        ? `Status: ${upcomingBooking.status}`
        : "Book a service now",
    },
    {
      title: "My Vehicles",
      value: totalVehicles.toString(),
      icon: Car,
      description: "Registered fleet",
    },
  ];

  const employeeMetrics = [
    {
      title: "Active Jobs",
      value: assignedJobs.toString(),
      icon: Wrench,
      description: "Current workload",
    },
    {
      title: "Completed",
      value: completedJobs.toString(),
      icon: CheckCircle2,
      description: "This month's summary",
    },
    {
      title: "Revenue Logged",
      value: `Rs. ${totalAmount.toLocaleString()}`,
      icon: CreditCard,
      description: "Total through the platform",
    },
  ];

  const metrics = isCustomer ? customerMetrics : employeeMetrics;

  const quickActions = isCustomer
    ? [
        {
          title: "Book New Service",
          description: "Schedule a wash, detail, or maintenance check.",
          to: "/dashboard/book",
          icon: Plus,
          primary: true,
        },
        {
          title: "My Vehicles",
          description: "Manage your registered cars and preferences.",
          to: "/dashboard/vehicles",
          icon: Users,
          primary: false,
        },
        {
          title: "Payment Records",
          description: "View your past invoices and receipts.",
          to: "/dashboard/payments",
          icon: CreditCard,
          primary: false,
        },
        {
          title: "History",
          description: "Review all services performed on your vehicles.",
          to: "/dashboard/history",
          icon: History,
          primary: false,
        },
      ]
    : [
        {
          title: "Record Payment",
          description: "Log a completed transaction for a customer.",
          to: "/dashboard/employee/payments",
          icon: Plus,
          primary: true,
        },
        {
          title: "Active Services",
          description: "Manage jobs currently in progress.",
          to: "/dashboard/employee/assigned",
          icon: Wrench,
          primary: false,
        },
        {
          title: "Manage Services",
          description: "Update pricing and service availability.",
          to: "/dashboard/admin/services",
          icon: Settings,
          primary: false,
        },
        {
          title: "Customer Database",
          description: "View and manage customer information.",
          to: "/dashboard/admin/customers",
          icon: Users,
          primary: false,
        },
      ];

  const recentActivity = data.bookings
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your account today.
          </p>
        </div>
        {isCustomer && (
          <Link to="/dashboard/book">
            <Button
              className={`${COLORS.bg.brand} ${COLORS.bg.brandHover} text-white px-6 shadow-sm`}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </Link>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} loading={loading} />
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activity/Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Link
                to={
                  isCustomer
                    ? "/dashboard/bookings"
                    : "/dashboard/employee/assigned"
                }
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600"
                >
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-50 animate-pulse rounded-lg border border-gray-100"
                      ></div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.bookingid}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 bg-white"
                    >
                      <div
                        className={`p-2 rounded ${
                          activity.status === "completed"
                            ? "bg-green-50 text-green-600"
                            : activity.status === "confirmed"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {activity.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Calendar className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium capitalize">
                            {activity.status} Service
                          </p>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {activity.startTime}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Scheduled for{" "}
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-400">
                      No recent activity to show.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 text-left">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>

          <Card className="bg-gray-900 text-white border-none overflow-hidden relative">
            <div className="p-6 relative z-10">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-xs text-gray-400 mb-4">
                Our support team is available 24/7 for any urgent washing
                matters.
              </p>
              <Button
                variant="outline"
                className="w-full bg-transparent border-gray-700 hover:bg-gray-800 text-white text-xs"
              >
                Contact Support
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 opacity-10 rounded-full -mr-16 -mt-16"></div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
