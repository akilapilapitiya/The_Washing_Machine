import React, { useState } from "react";
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
  Bell,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/lib/colors";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import logo from "../../assets/logo.svg";

const SidebarItem = ({ to, icon: Icon, label, active, nested = false }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 transition-colors duration-200 border-l-4 ${
      nested ? "px-4 pl-8 py-2" : "px-4 py-3"
    } ${
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

const SidebarGroup = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent"
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="space-y-1">{children}</div>}
    </div>
  );
};

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
    { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
    { to: "/dashboard/feedback", icon: MessageSquare, label: "Feedback" },
  ];

  // Owner gets grouped navigation
  const isOwner = emptype === "owner";

  // Non-owner employee links (cashier, employee)
  const employeeLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    {
      to: "/dashboard/employee/assigned",
      icon: Wrench,
      label: "Service Queue",
      roles: ["cashier", "employee"],
    },
    {
      to: "/dashboard/admin/bookings",
      icon: ListChecks,
      label: "Review Bookings",
      roles: ["cashier"],
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
      roles: ["cashier"],
    },
    {
      to: "/dashboard/admin/customers",
      icon: Users,
      label: "Customers",
      roles: ["cashier"],
    },
  ];

  const filteredEmployeeLinks = employeeLinks.filter((link) => {
    if (!link.roles) return true;
    return link.roles.includes(emptype);
  });

  // Render different sidebar based on role
  const renderOwnerSidebar = () => (
    <>
      <SidebarItem
        to="/dashboard"
        icon={LayoutDashboard}
        label="Overview"
        active={location.pathname === "/dashboard"}
      />

      <SidebarGroup title="Operations" icon={Wrench} defaultOpen={true}>
        <SidebarItem
          to="/dashboard/employee/assigned"
          icon={Wrench}
          label="Service Queue"
          active={location.pathname === "/dashboard/employee/assigned"}
          nested
        />
        <SidebarItem
          to="/dashboard/admin/bookings"
          icon={ListChecks}
          label="Review Bookings"
          active={location.pathname === "/dashboard/admin/bookings"}
          nested
        />
        <SidebarItem
          to="/dashboard/employee/payments"
          icon={CreditCard}
          label="Record Payment"
          active={location.pathname === "/dashboard/employee/payments"}
          nested
        />
      </SidebarGroup>

      <SidebarGroup title="Management" icon={Users}>
        <SidebarItem
          to="/dashboard/admin/employees"
          icon={ShieldCheck}
          label="Employees"
          active={location.pathname === "/dashboard/admin/employees"}
          nested
        />
        <SidebarItem
          to="/dashboard/admin/customers"
          icon={Users}
          label="Customers"
          active={location.pathname === "/dashboard/admin/customers"}
          nested
        />
        <SidebarItem
          to="/dashboard/admin/services"
          icon={Settings}
          label="Services"
          active={location.pathname === "/dashboard/admin/services"}
          nested
        />
        <SidebarItem
          to="/dashboard/admin/incidents"
          icon={ShieldAlert}
          label="Incidents"
          active={location.pathname === "/dashboard/admin/incidents"}
          nested
        />
        <SidebarItem
          to="/dashboard/admin/feedback"
          icon={MessageSquare}
          label="Feedback"
          active={location.pathname === "/dashboard/admin/feedback"}
          nested
        />
        <SidebarItem
          to="/dashboard/admin/attendance"
          icon={Calendar}
          label="Attendance"
          active={location.pathname === "/dashboard/admin/attendance"}
          nested
        />
        <SidebarItem
          to="/dashboard/employee/leaves"
          icon={Umbrella}
          label="My Leaves"
          active={location.pathname === "/dashboard/employee/leaves"}
          nested
        />
      </SidebarGroup>

      <SidebarGroup title="Configuration" icon={Settings}>
        <SidebarItem
          to="/dashboard/admin/vehicle-catalog"
          icon={Database}
          label="Vehicle Catalog"
          active={location.pathname === "/dashboard/admin/vehicle-catalog"}
          nested
        />
        <SidebarItem
          to="/dashboard/admin/settings/pricing"
          icon={CreditCard}
          label="Travel Pricing"
          active={location.pathname === "/dashboard/admin/settings/pricing"}
          nested
        />
      </SidebarGroup>

      <SidebarGroup title="Reports" icon={BarChart3}>
        <SidebarItem
          to="/dashboard/admin/reports/daily-income"
          icon={BarChart3}
          label="Daily Income"
          active={location.pathname === "/dashboard/admin/reports/daily-income"}
          nested
        />
        <SidebarItem
          to="/dashboard/admin/reports/employee-performance"
          icon={BarChart3}
          label="Employee Performance"
          active={
            location.pathname ===
            "/dashboard/admin/reports/employee-performance"
          }
          nested
        />
      </SidebarGroup>
    </>
  );

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
          {isCustomer
            ? customerLinks.map((link) => (
                <SidebarItem
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  active={location.pathname === link.to}
                />
              ))
            : isOwner
              ? renderOwnerSidebar()
              : filteredEmployeeLinks.map((link) => (
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
