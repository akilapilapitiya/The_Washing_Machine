import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const customerTiles = [
  {
    title: "Book Service Now",
    description: "Schedule a new vehicle service appointment",
    to: "/dashboard/book",
  },
  {
    title: "My Bookings",
    description: "View and manage your scheduled appointments",
    to: "/dashboard/bookings",
  },
  {
    title: "Manage Vehicles",
    description: "Add, edit, or remove vehicles on your account",
    to: "/dashboard/vehicles",
  },
  {
    title: "Service History",
    description: "Review past services and completed work",
    to: "/dashboard/history",
  },
  {
    title: "Payment History",
    description: "View receipts and transaction records",
    to: "/dashboard/payments",
  },
  {
    title: "Submit Feedback",
    description: "Share your experience with our team",
    to: "/dashboard/feedback",
  },
  {
    title: "Change Password",
    description: "Update your account password for security",
    to: "/dashboard/change-password",
  },
];

const employeeTiles = [
  {
    title: "Watch Assigned Services",
    description: "See your queue and upcoming jobs",
    to: "/dashboard/employee/assigned",
  },
  {
    title: "Record Payment",
    description: "Log payments received from customers",
    to: "/dashboard/employee/payments",
  },
  {
    title: "Stats & Analytics",
    description: "Track performance and service metrics",
    to: "/dashboard/employee/stats",
  },
  {
    title: "Manage Employees",
    description: "Add, promote, and manage team members",
    to: "/dashboard/admin/employees",
  },
  {
    title: "Manage Services",
    description: "Add, edit, and manage available services",
    to: "/dashboard/admin/services",
  },
  {
    title: "Manage Customers",
    description: "Add new customers and view existing ones",
    to: "/dashboard/admin/customers",
  },
  {
    title: "My Profile",
    description: "View and edit your account information",
    to: "/dashboard/profile",
  },
  {
    title: "Change Password",
    description: "Update your account password for security",
    to: "/dashboard/change-password",
  },
];

const TileGrid = ({ title, tiles }) => (
  <section className="space-y-4">
    <div>
      <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
        {title}
      </p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {tiles.map((tile) => (
        <Link key={tile.title} to={tile.to} className="group">
          <Card className="h-full border-gray-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                {tile.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">{tile.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  </section>
);

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-10">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Dashboard
          </p>
          <h1 className="text-4xl font-bold">Welcome to The Washing Machine</h1>
          <p className="text-gray-600 max-w-2xl">
            Quick actions for customers and employees. Choose a tile to get
            started.
          </p>
        </div>

        <TileGrid title="Customer" tiles={customerTiles} />
        <TileGrid title="Employee" tiles={employeeTiles} />
      </div>
    </div>
  );
};

export default DashboardPage;
