import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Car,
  History,
  CreditCard,
  Plus,
  Users,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/lib/colors";
import { formatDateSL } from "@/lib/dateFormat";

const MetricCard = ({ title, value, icon: Icon, description, loading }) => (
  <Card className="border-gray-200 shadow-sm overflow-hidden min-h-[120px] transition-all hover:border-red-200 hover:shadow-md">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1"></div>
          ) : (
            <h3 className="text-3xl font-bold mt-1 text-gray-900">{value}</h3>
          )}
          {description && !loading && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 ml-4">
          <Icon className="h-6 w-6 text-red-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const QuickAction = ({ title, description, to, icon: Icon, primary }) => (
  <Link to={to} className="group">
    <Card className={`h-full border-gray-200 transition-all hover:border-red-300 hover:shadow-lg ${primary ? "bg-white border-red-200 ring-1 ring-red-50" : "bg-white"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg ${primary ? "bg-red-600 text-white shadow-sm" : "bg-red-50 text-red-600"} transition-colors group-hover:scale-105 duration-300`}>
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

const CustomerDashboard = ({ data, loading }) => {
  const totalBookings = data.bookings.length;
  const totalVehicles = data.vehicles.length;

  const upcomingBooking = data.bookings
    .filter((b) => b.bookingstatus === "confirmed" || b.bookingstatus === "pending")
    .sort((a, b) => new Date(a.bookingdate) - new Date(b.bookingdate))[0];

  const recentActivity = data.bookings
    .sort((a, b) => new Date(b.bookingdate) - new Date(a.bookingdate))
    .slice(0, 4);
    
  // Find last completed service for quick rebook
  const lastCompleted = data.bookings
    .filter((b) => b.bookingstatus === "completed")
    .sort((a, b) => new Date(b.bookingdate) - new Date(a.bookingdate))[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-800 p-8 shadow-lg">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-red-400 opacity-20 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready for your next wash?
            </h2>
            <p className="text-red-100 max-w-lg leading-relaxed">
              Keep your fleet shining. Book your next premium service today and experience our expert care.
            </p>
          </div>
          <Button asChild size="lg" className="bg-white text-red-700 hover:bg-gray-50 font-bold shadow-sm shrink-0 h-12 px-8 rounded-xl">
             <Link to="/dashboard/book">
                <Plus className="mr-2 h-5 w-5" />
                Book Service
             </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Bookings"
          value={totalBookings.toString()}
          icon={Calendar}
          description="Services scheduled total"
          loading={loading}
        />
        <MetricCard
          title="Upcoming Service"
          value={upcomingBooking ? formatDateSL(upcomingBooking.bookingdate) : "-"}
          icon={Clock}
          description={upcomingBooking ? `Status: ${upcomingBooking.bookingstatus}` : "No upcoming bookings"}
          loading={loading}
        />
        <MetricCard
          title="My Garage"
          value={totalVehicles.toString()}
          icon={Car}
          description="Registered vehicles"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions & Rebook */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Rebook (If applicable) */}
          {!loading && lastCompleted && (
             <Card className="border-red-200 bg-red-50/30 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center p-6 gap-6">
                   <div className="p-4 bg-white rounded-full shadow-sm shrink-0 border border-red-100">
                     <History className="h-8 w-8 text-red-600" />
                   </div>
                   <div className="flex-1 text-center sm:text-left">
                     <h3 className="text-lg font-bold text-gray-900">Book Again</h3>
                     <p className="text-sm text-gray-600 mt-1">
                       Your last completed service was on <span className="font-semibold text-gray-800">{formatDateSL(lastCompleted.bookingdate)}</span>. Would you like to schedule another one?
                     </p>
                   </div>
                   <Button asChild className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm h-11 px-6">
                     <Link to="/dashboard/book">
                        Rebook Now
                        <ArrowRight className="ml-2 w-4 h-4" />
                     </Link>
                   </Button>
                </div>
             </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickAction
                title="Manage Vehicles"
                description="Add or remove cars from your personal garage."
                to="/dashboard/vehicles"
                icon={Users}
              />
              <QuickAction
                title="Service History"
                description="Review all past services and maintenance logs."
                to="/dashboard/history"
                icon={History}
              />
              <QuickAction
                title="Invoices & Receipts"
                description="View and download your payment records."
                to="/dashboard/payments"
                icon={CreditCard}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gray-50/50 border-b border-gray-100 rounded-t-lg">
               <CardTitle className="text-lg font-bold flex items-center gap-2">
                 <History className="h-5 w-5 text-red-600" />
                 Last Service
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="h-24 bg-gray-50 animate-pulse rounded-lg"></div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-6">
                  {/* Display only the very last service */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${recentActivity[0].bookingstatus === "completed" ? 'bg-green-50 text-green-700' : recentActivity[0].bookingstatus === "confirmed" ? 'bg-blue-50 text-blue-700' : recentActivity[0].bookingstatus === "pending" ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                           {recentActivity[0].bookingstatus}
                        </span>
                        <span className="text-xs text-gray-400 font-bold">#{recentActivity[0].bookingid}</span>
                     </div>
                     <p className="font-bold text-gray-900 text-lg mb-2">{recentActivity[0].servicename || "Wash Service"}</p>
                     <div className="flex items-center gap-4 mt-2 mb-4">
                        <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                           <Calendar size={14} className="text-gray-400" />
                           {formatDateSL(recentActivity[0].bookingdate)}
                        </p>
                        <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                           <Clock size={14} className="text-gray-400" />
                           {recentActivity[0].bookingstarttime}
                        </p>
                     </div>
                  </div>
                  
                  {/* See More Button */}
                  <Button asChild variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-semibold h-11">
                    <Link to="/dashboard/history">
                      See More in History <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">
                  <div className="flex justify-center mb-3">
                     <Car className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Your service history will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
