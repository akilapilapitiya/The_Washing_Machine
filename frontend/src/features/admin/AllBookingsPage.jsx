import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Car,
  User,
  ChevronRight,
  Loader2,
  Briefcase,
  Wrench,
  CheckCircle,
  Search,
  Filter,
} from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Link } from "react-router-dom";
import * as bookingService from "@/services/booking.service";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

import { toast } from "sonner";
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    inProgress: "bg-purple-50 text-purple-700 border-purple-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    paid: "bg-green-50 text-green-700 border-green-200",
  };

  const labels = {
    pending: "Pending",
    scheduled: "Scheduled",
    inProgress: "In Progress",
    completed: "Completed",
    paid: "Paid",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${styles[status] || styles.pending}`}
    >
      {labels[status] || status}
    </span>
  );
};

const ServiceTable = ({ services, isOwner, isCashier }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  const showActions = isOwner || isCashier;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Customer & Vehicle</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Date & Time</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Employee</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Services</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {services.map((s) => (
              <tr key={s.bookingid} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-gray-500 text-sm">
                    #{String(s.bookingid).padStart(4, "0")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">{s.cusname || "Unregistered"}</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {s.vehbrand} {s.vehmodel} • {s.vehplate}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                  <div className="flex flex-col">
                    <span>{formatDate(s.bookingdate)}</span>
                    <span className="text-xs text-gray-400">{s.bookingstarttime} - {s.bookingendtime}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-700">
                    {s.assigned_empname || (
                      <span className="text-gray-300 italic font-normal">Unassigned</span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {s.services && s.services.length > 0 ? (
                      s.services.map((svc, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-600 text-[9px] px-1.5 py-0.5 rounded font-bold border border-blue-100 uppercase">
                          {svc.serviceName || svc.servicename}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400">Standard</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={s.bookingstatus} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {showActions && (s.bookingstatus === "pending" || s.bookingstatus === "scheduled") && (
                      <Link to={`/dashboard/admin/bookings?search=${s.bookingid}`}>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase border-gray-200">
                          Reassign
                        </Button>
                      </Link>
                    )}
                    {showActions && s.bookingstatus === "completed" && (
                      <Link to={`/dashboard/employee/payments?bookingId=${s.bookingid}`}>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase border-red-100 text-red-600 hover:bg-red-50">
                          Pay
                        </Button>
                      </Link>
                    )}
                    <Link to={`/dashboard/employee/service/${s.bookingid}`}>
                      <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase border-gray-200">
                        View
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AllBookingsPage = () => {
  const [services, setServices] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const { isOwner, isCashier } = useAuth();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings();
      const searchId = searchParams.get("search");

      if (searchId) {
        const foundBooking = data.find(b => String(b.bookingid) === searchId);
        if (foundBooking) {
          setServices([foundBooking]); // Show only the targeted booking
          setSelectedBooking(foundBooking); // Keep track of the selected booking
          setSearchQuery(searchId); // Pre-fill search query with the ID
        } else {
          setServices([]); // No booking found for the ID
          toast.info(`No booking found with ID: ${searchId}`);
        }
      } else {
        setServices(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      toast.error("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    // Search query filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (s.cusname?.toLowerCase() || "").includes(query) ||
      (s.assigned_empname?.toLowerCase() || "").includes(query) ||
      (s.vehplate?.toLowerCase() || "").includes(query) ||
      String(s.bookingid).includes(query);

    // Date range filter
    let matchesDate = true;
    if (dateRange !== "all") {
      const bDate = new Date(s.bookingdate);
      const now = new Date();
      if (dateRange === "today") {
        matchesDate = isWithinInterval(bDate, { start: startOfDay(now), end: endOfDay(now) });
      } else if (dateRange === "week") {
        matchesDate = isWithinInterval(bDate, { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });
      } else if (dateRange === "month") {
        matchesDate = isWithinInterval(bDate, { start: startOfMonth(now), end: endOfMonth(now) });
      }
    }

    return matchesSearch && matchesDate;
  });

  const pendingServices = filteredServices.filter(
    (s) => s.bookingstatus === "pending" || s.bookingstatus === "scheduled",
  );
  const inProgressServices = filteredServices.filter(
    (s) => s.bookingstatus === "inProgress",
  );
  const completedServices = filteredServices.filter(
    (s) => s.bookingstatus === "completed" || s.bookingstatus === "paid",
  );

  useSetPageHeader(
    isOwner || isCashier ? "Service Operations" : "Employee Portal",
    isOwner || isCashier ? "Service Queue" : "My Assignments",
    isOwner || isCashier
      ? "Manage all bookings, view status, and assign tasks."
      : "View your upcoming and active service tasks."
  );

  if (loading) return <PageLoader message="Loading bookings..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by customer, employee, plate or ID..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                dateRange === range.id
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-8">
        <TabsList className="bg-white border p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="upcoming"
              className="rounded-md data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all font-medium text-sm px-4 py-2"
            >
              Upcoming ({pendingServices.length})
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="rounded-md data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all font-medium text-sm px-4 py-2"
            >
              Active ({inProgressServices.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-md data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all font-medium text-sm px-4 py-2"
            >
              Completed ({completedServices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="upcoming"
            className="space-y-4"
          >
            {pendingServices.length > 0 ? (
              <ServiceTable services={pendingServices} isOwner={isOwner} isCashier={isCashier} />
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                <h3 className="font-semibold text-gray-900">
                  No upcoming bookings
                </h3>
                <p className="text-gray-500 text-sm">
                  Checks back later for new assignments.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="in-progress"
            className="space-y-4"
          >
            {inProgressServices.length > 0 ? (
              <ServiceTable services={inProgressServices} isOwner={isOwner} isCashier={isCashier} />
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <Wrench size={32} className="mx-auto text-gray-300 mb-2" />
                <h3 className="font-semibold text-gray-900">
                  No active jobs
                </h3>
                <p className="text-gray-500 text-sm">
                  There are no services currently in progress.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="completed"
            className="space-y-4"
          >
            {completedServices.length > 0 ? (
              <ServiceTable services={completedServices} isOwner={isOwner} isCashier={isCashier} />
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <CheckCircle
                  size={32}
                  className="mx-auto text-gray-300 mb-2"
                />
                <h3 className="font-semibold text-gray-900">
                  No completed services
                </h3>
                <p className="text-gray-500 text-sm">
                   Completed service records will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    
  );
};

export default AllBookingsPage;
