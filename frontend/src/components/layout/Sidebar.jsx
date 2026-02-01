import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Car,
  History,
  CreditCard,
  MessageSquare,
  User,
  ShieldCheck,
  Users,
  Wrench,
  Settings,
  Database,
  LogOut,
  Umbrella,
  ShieldAlert,
  BarChart3,
  ListChecks,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/lib/colors";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import logo from "../../assets/logo.svg";

const SidebarItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 transition-colors duration-200 border-l-4 ${
      active
        ? `${COLORS.bg.brandLight} ${COLORS.text.brand} border-red-600 font-semibold`
        : `text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900`
    }`}
  >
    <Icon
      className={`h-5 w-5 ${active ? COLORS.text.brand : "text-gray-400"}`}
    />
    <span className="text-sm">{label}</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const { user, isCustomer, isEmployee, emptype, logout } = useAuth();
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();

  const handleLogout = async () => {
    const confirmed = await confirm({
      variant: "warning",
      title: "Logout?",
      description: "Are you sure you want to log out of your account?",
      confirmText: "Logout",
      cancelText: "Stay Logged In",
    });

    if (confirmed) {
      logout();
    }
  };

  const customerLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/book", icon: Calendar, label: "Book Service" },
    { to: "/dashboard/bookings", icon: Calendar, label: "My Bookings" },
    { to: "/dashboard/vehicles", icon: Car, label: "Manage Vehicles" },
    { to: "/dashboard/history", icon: History, label: "Service History" },
    { to: "/dashboard/payments", icon: CreditCard, label: "Payments" },
    { to: "/dashboard/feedback", icon: MessageSquare, label: "Feedback" },
  ];

  const employeeLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    {
      to: "/dashboard/employee/assigned",
      icon: Wrench,
      label: "Service Queue",
      roles: ["owner", "cashier", "employee"],
    },
    {
      to: "/dashboard/admin/bookings",
      icon: ListChecks,
      label: "Review Bookings",
      roles: ["owner", "cashier"],
    },
    {
      to: "/dashboard/employee/incidents",
      icon: ShieldAlert,
      label: "Report Incident",
      roles: ["cashier", "employee"],
    },
    {
      to: "/dashboard/employee/leaves",
      icon: Umbrella,
      label: "My Leaves",
      roles: ["cashier", "employee"],
    },
    {
      to: "/dashboard/employee/payments",
      icon: CreditCard,
      label: "Record Payment",
      roles: ["owner", "cashier"],
    },
    {
      to: "/dashboard/admin/services",
      icon: Settings,
      label: "Services",
      roles: ["owner"],
    },
    {
      to: "/dashboard/admin/vehicle-catalog",
      icon: Database,
      label: "Vehicle Catalog",
      roles: ["owner"],
    },
    {
      to: "/dashboard/admin/incidents",
      icon: ShieldAlert,
      label: "Incidents",
      roles: ["owner"],
    },
    {
      to: "/dashboard/admin/customers",
      icon: Users,
      label: "Customers",
      roles: ["owner", "cashier"],
    },
    {
      to: "/dashboard/admin/feedback",
      icon: MessageSquare,
      label: "Feedback",
      roles: ["owner"],
    },
    {
      to: "/dashboard/admin/employees",
      icon: ShieldCheck,
      label: "Employees",
      roles: ["owner"],
    },
    {
      to: "/dashboard/admin/reports/daily-income",
      icon: BarChart3,
      label: "Daily Income",
      roles: ["owner"],
    },
    {
      to: "/dashboard/admin/attendance",
      icon: Calendar,
      label: "Attendance",
      roles: ["owner"],
    },
  ];

  const filteredEmployeeLinks = employeeLinks.filter((link) => {
    if (!link.roles) return true; // Default to public for employees (e.g. Overview)
    return link.roles.includes(emptype);
  });

  const links = isCustomer ? customerLinks : filteredEmployeeLinks;

  return (
    <aside className="fixed top-16 bottom-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Navigation Links */}
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </p>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <SidebarItem
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              active={location.pathname === link.to}
            />
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors rounded-md border border-transparent hover:border-gray-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
      <ConfirmDialog />
    </aside>
  );
};

export default Sidebar;
