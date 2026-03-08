import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { IMAGE_BASE_URL } from "@/configs/env";
import logo from "../assets/logo.svg";
import NotificationBell from "./common/NotificationBell";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    // Profile picture loaded from auth context
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/#home", label: "Home", hash: "home" },
    { path: "/#services", label: "Services", hash: "services" },
    { path: "/#partners", label: "Partners", hash: "partners" },
    { path: "/#contact", label: "Contact", hash: "contact" },
  ];

  const handleScrollToSection = (e, hash) => {
    // If not on home page, let the link navigation happen usually to /#hash
    // But since we are using HashRouter or similar mostly, if we are on /, prevent default
    if (location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setIsMenuOpen(false);
      }
    } else {
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <img
              src={logo}
              alt="The Washing Machine Logo"
              className="h-10 w-auto object-contain transition-transform transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => handleScrollToSection(e, item.hash)}
                className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="flex flex-col items-end hidden lg:flex">
                  <span className="text-sm font-bold text-gray-900 leading-none">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                    Logged In
                  </span>
                </div>
                <Link to="/dashboard" className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform">
                    {user?.profile_picture_url ? (
                      <img
                        src={`${IMAGE_BASE_URL}${user.profile_picture_url}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <Button className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-6 shadow-md transition-all">
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-red-700 hover:bg-red-50 font-medium px-4"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-6 shadow-md transition-all">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-red-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top-5 fade-in duration-200">
          <div className="px-4 py-6 space-y-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={(e) => handleScrollToSection(e, item.hash)}
                  className="text-base font-medium text-gray-900 hover:text-red-600 py-2 border-b border-gray-50 last:border-0"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg overflow-hidden border-2 border-white">
                      {user?.profile_picture_url ? (
                        <img
                          src={`${IMAGE_BASE_URL}${user.profile_picture_url}`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        user?.name?.charAt(0) || "U"
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg border-gray-200"
                    onClick={() => {
                      handleLogout();
                    }}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full rounded-lg border-gray-200 text-gray-700"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg">
                      Sign Up Now
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
