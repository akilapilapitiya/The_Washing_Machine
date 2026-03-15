import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";

const Footer = ({ id }) => {
  return (
    <footer id={id} className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img loading="lazy"
                src={logo}
                alt="The Washing Machine Logo"
                className="h-auto w-50 object-cover rounded"
              />
            </div>
            <p className="text-sm mb-4">
              Your trusted partner for professional vehicle cleaning and
              detailing services.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/share/1EFn99hw8z/"
                className="hover:text-blue-500 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-blue-500 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-blue-500 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-blue-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Full Body Wash
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Iris Tinting
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Body Detailing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Intererior Cleaning
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Wheel Polishing
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>
                  488, Hight level Road, Pannipitiya, Colombo, Sri Lanka
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>077 350 7777</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>info@washingmachine.com</span>
              </li>
              <li className="flex items-center span-x-3">
                <a href="https://www.facebook.com/share/1EFn99hw8z/">
                  <Facebook className="h-5 w-5 text-blue-500 flex-shrink-0" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>
              &copy; {new Date().getFullYear()} The Washing Machine. All rights
              reserved.
            </p>
            <Link
              to="/employee-login"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Employee Portal →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
