import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/partners", label: "Partners" },
    { path: "/services", label: "Services" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={logo}
              alt="The Washing Machine Logo"
              className="h-auto w-50 object-cover rounded"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="font-medium"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Authenticated user buttons */}
                <Link to="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name || "User"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Guest user buttons */}
                <Link to="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="w-full justify-start font-medium"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  {/* Authenticated user - mobile */}
                  <div className="px-3 py-2 bg-gray-100 rounded-md">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {user?.name || "User"}
                      </span>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  {/* Guest user - mobile */}
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
