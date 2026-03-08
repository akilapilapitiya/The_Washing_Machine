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
import logo from "../../assets/logo.svg";
import { PageHeaderProvider } from "@/contexts/PageHeaderContext";
import PageSubHeader from "./PageSubHeader";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <PageHeaderProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Fixed Top Header - Full Width */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              className="p-1 text-gray-600 hover:text-gray-900 lg:hidden focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={logo}
                alt="The Washing Machine Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Right Actions */}
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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] py-2 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 mx-1 rounded-t-lg mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate font-medium">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1 px-1">
                    <Link
                      to="/dashboard/profile"
                      className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors mx-1"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserCircle className="mr-3 h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      <span className="font-medium">My Profile</span>
                    </Link>
                    <Link
                      to="/dashboard/change-password"
                      className="group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors mx-1"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-1 px-1 mt-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors mx-1"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      <span className="font-medium">Logout</span>
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
        </header>

        {/* Main Layout Container */}
        <div className="flex flex-1 pt-16 min-h-screen">
          {/* Desktop Sidebar (Fixed Left, below header) */}
          <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 border-r border-gray-200 bg-white">
            <Sidebar />
          </div>

          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div
                className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 flex flex-col pt-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Mobile Sidebar Header */}
                <div className="px-4 pb-4 flex items-center justify-between border-b border-gray-100">
                  <span className="font-bold text-lg text-red-600">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 lg:ml-64 w-full bg-gray-50 flex flex-col">
            <PageSubHeader />
            <div className="p-4 lg:p-8 flex-1">
              <div className="max-w-7xl mx-auto h-full">
                <Outlet />
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="lg:ml-64 p-4 border-t border-gray-200 bg-white text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} The Washing Machine. All rights
            reserved.
          </p>
        </footer>
      </div>
    </PageHeaderProvider>
  );
};

export default DashboardLayout;
