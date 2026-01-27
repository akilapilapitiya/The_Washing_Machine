import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  User,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/lib/colors";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <User size={16} className="text-gray-600" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard/profile"
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserCircle className="mr-3 h-4 w-4 text-gray-400 group-hover:text-red-500" />
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard/change-password"
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-red-500" />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-gray-400 group-hover:text-red-600" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Backdrop for closing dropdown */}
            {isProfileMenuOpen && (
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsProfileMenuOpen(false)}
              ></div>
            )}
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
