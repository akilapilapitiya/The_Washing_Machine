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
          
          {/* LEFT: Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex-shrink-0 transition-opacity hover:opacity-90">
              <img
                src={logo}
                alt="The Washing Machine Logo"
                className="h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* CENTER: Navigation Links - Absolutely Centered */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-8">
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
                      isLinkActive(item.path) ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
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

          {/* RIGHT: Actions */}
          <div className="flex-1 flex items-center justify-end">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                      Welcome back
                    </span>
                    <span className="text-sm font-bold text-gray-900 leading-none">
                      {user?.name}
                    </span>
                  </div>
                  <UserAvatar user={user} size="sm" />
                  <Link to="/dashboard">
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm h-9 px-5 rounded-lg shadow-sm transition-all flex items-center gap-2">
                      Dashboard
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-transparent h-9 px-4 transition-colors">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/dashboard/book">
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm h-9 px-5 rounded-lg shadow-sm transition-all">
                      Book Service
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 ml-4 text-gray-900 transition-colors hover:text-red-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className={`fixed inset-0 bg-white z-40 lg:hidden flex flex-col p-8 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            scrolled ? "top-16" : "top-20"
          }`}
        >
          <div className="flex flex-col space-y-5">
            {navItems.map((item) => (
              <React.Fragment key={item.label}>
                {item.hash ? (
                  <a
                    href={item.path}
                    onClick={(e) => handleScrollToSection(e, item.hash)}
                    className="text-2xl font-black text-gray-900 hover:text-red-600 transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-2xl font-black transition-colors ${
                      isLinkActive(item.path) ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-13 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-lg shadow-sm">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-13 border-gray-200 text-gray-900 font-bold rounded-xl text-lg hover:bg-gray-50">
                    Log in
                  </Button>
                </Link>
                <Link to="/dashboard/book" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-13 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-lg shadow-sm">
                    Book Service Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
