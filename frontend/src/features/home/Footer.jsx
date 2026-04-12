import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";

const Footer = ({ id }) => {
  return (
    <footer id={id} className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                loading="lazy"
                src={logo}
                alt="The Washing Machine Logo"
                className="h-auto w-50 object-cover rounded"
              />
            </div>
            <p className="text-sm mb-6">
              Your trusted partner for professional vehicle cleaning and
              detailing services.
            </p>
            {/* Map Embed */}
            <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-800 shadow-inner mb-6 grayscale hover:grayscale-0 transition-all duration-700">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.3721159491074!2d79.944049074591!3d6.8459165931523325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2513674483ff9%3A0x5b7627e5c868c932!2sThe%20Washing%20Machine%20(PVT)%20LTD!5e0!3m2!1sen!2slk!4v1775964165992!5m2!1sen!2slk" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="The Washing Machine Location"
              ></iframe>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-red-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-red-600 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-red-600 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-red-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-red-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>
                  488, Hight level Road, Pannipitiya, Colombo, Sri Lanka
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span>077 350 7777</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span>info@washingmachine.com</span>
              </li>
              <li className="flex items-center">
                <a 
                  href="https://www.facebook.com/share/18G7HJWpik/"
                  className="flex items-center space-x-3 hover:text-red-600 transition-colors"
                >
                  <Facebook className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span>The Washing Machine</span>
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
