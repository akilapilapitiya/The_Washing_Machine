import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { Mail, Phone, MapPin, Facebook, ArrowRight } from "lucide-react";

const Footer = ({ id }) => {
  return (
    <footer id={id} className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-6 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Mission */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center mb-4">
              <img
                loading="lazy"
                src={logo}
                alt="The Washing Machine Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            {/* Hidden on mobile to keep footer compact */}
            <p className="text-sm leading-relaxed text-gray-400 mb-4 hidden md:block max-w-xs">
              Meticulous car care delivered by experts. We combine cutting-edge
              tech with premium products to restore your vehicle's showroom
              glory.
            </p>
          </div>

          {/* Column 2: Quick Navigation - Hidden on Mobile */}
          <div className="hidden md:flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4 px-1 border-l-2 border-red-600">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm font-medium">
              {[
                { to: "/", label: "Home" },
                { to: "/services", label: "Services" },
                { to: "/pricing", label: "Pricing" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="hover:text-red-600 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Details - Always Shown */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4 px-1 border-l-2 border-red-600">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <MapPin className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-gray-400">
                  488, High Level Road, Pannipitiya, Colombo
                </span>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <Phone className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-gray-400 font-bold">077 350 7777</span>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <Mail className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-gray-400">info@washingmachine.com</span>
              </li>
              <li className="flex items-center">
                <a
                  href="https://www.facebook.com/share/18G7HJWpik/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 hover:text-red-600 transition-colors"
                >
                  <Facebook className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span className="font-semibold">The Washing Machine</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Location Map - Hidden on Mobile */}
          <div className="hidden md:flex flex-col items-center md:items-start transition-all">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4 px-1 border-l-2 border-red-600">
              Our Location
            </h3>
            <div className="w-full h-40 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
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
            <a
              href="https://www.facebook.com/share/18G7HJWpik/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-[10px] font-bold text-gray-500 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              Get Directions <ArrowRight size={10} />
            </a>
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
