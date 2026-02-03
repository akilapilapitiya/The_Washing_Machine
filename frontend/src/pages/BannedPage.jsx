import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Phone, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BannedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <ShieldAlert size={48} className="text-red-600" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-lg shadow-lg">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
              !
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Account Restricted
          </h1>
          <p className="text-gray-500 font-medium text-lg px-2">
            Your access to The Washing Machine platform has been restricted by
            the administration.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            For Inquiries & Appeals
          </p>

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-red-50 transition-colors">
              <div className="p-3 bg-white rounded-xl shadow-sm text-gray-400 group-hover:text-red-600">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Call us at
                </p>
                <p className="text-gray-900 font-bold">+94 112 345 678</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-red-50 transition-colors">
              <div className="p-3 bg-white rounded-xl shadow-sm text-gray-400 group-hover:text-red-600">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Email support
                </p>
                <p className="text-gray-900 font-bold">
                  support@washingmachine.lk
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Link to="/">
            <Button
              variant="ghost"
              className="text-gray-500 font-bold uppercase tracking-widest text-xs gap-2"
            >
              <ArrowLeft size={16} />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BannedPage;
