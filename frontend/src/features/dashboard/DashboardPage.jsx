import React from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/lib/colors";

const MetricCard = ({ title, value, icon: Icon, description, trend }) => (
  <Card className="border-gray-200 shadow-sm overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${COLORS.bg.brandLight} border border-red-100`}
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
      className={`h-full border-gray-200 transition-all hover:border-red-200 hover:shadow-md ${primary ? "bg-white border-red-100" : "bg-white"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded ${primary ? COLORS.bg.brand : COLORS.bg.brandLight} ${primary ? "text-white" : COLORS.text.brand} transition-colors`}
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

  // Mock data for the metrics (In a real app, fetch these)
  const customerMetrics = [
    {
      title: "Total Bookings",
      value: "12",
      icon: Calendar,
      description: "Scheduled services",
    },
    {
      title: "Upcoming",
      value: "1",
      icon: Clock,
      description: "Next: Tomorrow, 10 AM",
    },
    {
      title: "Reward Points",
      value: "450",
      icon: CheckCircle2,
      description: "50 points to next discount",
    },
  ];

  const employeeMetrics = [
    {
      title: "Assigned Jobs",
      value: "5",
      icon: Wrench,
      description: "For today",
    },
    {
      title: "Completed",
      value: "28",
      icon: CheckCircle2,
      description: "This month",
    },
    {
      title: "Revenue Logged",
      value: "$1,240",
      icon: CreditCard,
      description: "Last 7 days",
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
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activity/Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Empty State / Mock Activity */}
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-dashed border-gray-200">
                  <div className="p-2 bg-green-50 rounded text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Service Completed</p>
                    <p className="text-xs text-gray-500">
                      Your Toyota Corolla (ABC-123) was serviced successfully.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-dashed border-gray-200">
                  <div className="p-2 bg-blue-50 rounded text-blue-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New Booking Confirmed</p>
                    <p className="text-xs text-gray-500">
                      Scheduled for Wednesday at 10:00 AM.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
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
