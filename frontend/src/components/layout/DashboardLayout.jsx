import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, X, Search, User } from "lucide-react";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/lib/colors";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="ml-2 font-semibold text-gray-900">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center lg:hidden">
              <User size={16} className="text-gray-600" />
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer (Optional) */}
        <footer className="p-4 lg:px-8 border-t border-gray-200 bg-white text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} The Washing Machine. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
