import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { IMAGE_BASE_URL } from "@/configs/env";
import UserAvatar from "../common/UserAvatar";
import logo from "../../assets/logo.svg";

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Home", hash: "home" },
    { path: "/services", label: "Services" },
    { path: "/marketplace", label: "Marketplace" },
    { path: "/#partners", label: "Partners", hash: "partners" },
    { path: "/#contact", label: "Contact", hash: "contact" },
  ];

  const handleScrollToSection = (e, hash) => {
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

  const isLinkActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
          : "h-20 bg-white border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="relative flex items-center justify-between h-full">
          {/* LEFT: Mobile Menu Toggle / Desktop Logo */}
          <div className="flex-1 flex items-center justify-start gap-4">
            {/* Mobile Menu Toggle (LEFT on mobile) */}
            <button
              className="lg:hidden p-2 -ml-2 text-gray-900 transition-colors hover:text-red-600 focus:outline-none"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={26} />
            </button>

            {/* Logo (Left-aligned on Desktop, hidden on Mobile center-logo config below) */}
            <Link
              to="/"
              className="hidden lg:block flex-shrink-0 transition-opacity hover:opacity-90"
            >
              <img
                src={logo}
                alt="The Washing Machine Logo"
                className="h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* CENTER: Mobile Logo / Desktop Navigation */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            {/* Mobile Logo (Centered only on small screens) */}
            <Link
              to="/"
              className="lg:hidden flex-shrink-0 transition-opacity hover:opacity-90"
            >
              <img
                src={logo}
                alt="The Washing Machine Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <React.Fragment key={item.label}>
                  {item.hash ? (
                    <a
                      href={item.path}
                      onClick={(e) => handleScrollToSection(e, item.hash)}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors duration-200 relative py-1"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`text-sm font-semibold transition-colors duration-200 relative py-1 ${
                        isLinkActive(item.path)
                          ? "text-gray-900"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {item.label}
                      {isLinkActive(item.path) && (
                        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
                      )}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex-1 flex items-center justify-end">
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3 sm:gap-6">
                  {/* Hide Welcome Back on extra small mobile */}
                  <div className="hidden xs:flex flex-col items-end text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                      Welcome back
                    </span>
                    <span className="text-sm font-bold text-gray-900 leading-none">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </div>
                  <UserAvatar user={user} size="sm" />
                  <Link to="/dashboard" className="hidden sm:block">
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm h-9 px-5 rounded-lg shadow-sm transition-all flex items-center gap-2">
                      Dashboard
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-transparent h-9 px-4 transition-colors"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link to="/dashboard/book" className="hidden sm:block">
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm h-9 px-5 rounded-lg shadow-sm transition-all">
                      Book Service
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Slide from Left) */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white z-[70] lg:hidden flex flex-col shadow-2xl transition-transform duration-300 transform translate-x-0 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info (if logged in) */}
            {isAuthenticated && (
              <div className="p-6 border-b border-gray-100 bg-red-50/30">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6">
              <div className="px-6 mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Navigation
                </span>
              </div>
              <div className="flex flex-col">
                {navItems.map((item) => (
                  <React.Fragment key={item.label}>
                    {item.hash ? (
                      <a
                        href={item.path}
                        onClick={(e) => handleScrollToSection(e, item.hash)}
                        className="px-6 py-4 text-lg font-bold text-gray-600 hover:text-red-600 hover:bg-red-50/50 transition-all border-l-4 border-transparent hover:border-red-600"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`px-6 py-4 text-lg font-bold transition-all border-l-4 ${
                          isLinkActive(item.path)
                            ? "text-red-600 bg-red-50/50 border-red-600"
                            : "text-gray-600 border-transparent hover:text-red-600 hover:bg-red-50/50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full h-12 border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link
                    to="/dashboard/book"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm">
                      Book Service Now
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default PublicNavbar;
