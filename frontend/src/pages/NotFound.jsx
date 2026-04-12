import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.svg";

const NotFound = () => {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-gray-50 overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Monolithic Typography */}
        <h1 className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-gray-900 select-none">
          404
        </h1>
        
        <div className="mt-4 space-y-2">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-gray-500">
            Page Not Found
          </h2>
          <p className="text-gray-600 font-medium">
            The resource you are looking for has been moved or does not exist.
          </p>
        </div>

        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
