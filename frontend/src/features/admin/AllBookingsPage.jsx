import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Wrench,
  User,
  ChevronRight,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";
import * as bookingService from "@/services/booking.service";
import { useAuth } from "@/contexts/AuthContext";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-gray-100 text-gray-800 border-gray-300",
    inProgress: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-300",
    paid: "bg-green-100 text-green-800 border-green-300",
  };

  const labels = {
    pending: "Upcoming",
    scheduled: "Upcoming",
    inProgress: "In Progress",
    completed: "Completed",
    paid: "Paid",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${styles[status] || styles.pending}`}
    >
      {labels[status] || status}
    </span>
  );
};

const ServiceCard = ({ service }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link to={`/dashboard/employee/service/${service.bookingid}`}>
      <Card className="transition hover:shadow-md hover:border-red-200 cursor-pointer h-full">
        <CardHeader className="pb-3 border-b mb-4 bg-gray-50/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-sm font-bold truncate">
                  {service.vehbrand} {service.vehmodel}
                </CardTitle>
                <StatusBadge status={service.bookingstatus} />
              </div>
              <p className="text-[10px] font-mono text-gray-500">
                REF: {service.bookingid}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User size={12} className="flex-shrink-0 text-red-600" />
              <span className="font-semibold text-gray-900">
                {service.cusname || "Unregistered"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Car size={12} className="flex-shrink-0 text-gray-400" />
              <span className="font-mono text-gray-900">
                {service.vehplate}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar size={12} className="flex-shrink-0 text-gray-400" />
              <span>{formatDate(service.bookingdate)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock size={12} className="flex-shrink-0 text-gray-400" />
              <span>
                {service.bookingstarttime} - {service.bookingendtime}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 text-[10px]">
                <Wrench
                  size={12}
                  className="text-gray-400 mt-0.5 flex-shrink-0"
                />
                <div className="flex flex-wrap gap-1">
                  {service.services && service.services.length > 0 ? (
                    service.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200"
                      >
                        {s.serviceName}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Standard Wash</span>
                  )}
                </div>
              </div>

              {service.assigned_empname && (
                <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-red-50/50 p-1.5 rounded border border-red-100">
                  <Briefcase size={10} className="text-red-600" />
                  <span className="font-bold">
                    Assigned to: {service.assigned_empname}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const AllBookingsPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOwner, isCashier } = useAuth();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookings();
      setServices(data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Unable to synchronize with the service registry.");
    } finally {
      setLoading(false);
    }
  };

  const pendingServices = services.filter(
    (s) => s.bookingstatus === "pending" || s.bookingstatus === "scheduled",
  );
  const inProgressServices = services.filter(
    (s) => s.bookingstatus === "inProgress",
  );
  const completedServices = services.filter(
    (s) => s.bookingstatus === "completed" || s.bookingstatus === "paid",
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold">
            {isOwner || isCashier ? "Operations Registry" : "My Detailing Log"}
          </p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Force Services
          </h1>
          <p className="text-gray-500 text-sm max-w-2xl">
            {isOwner || isCashier
              ? "Comprehensive deployment overview. Track pending, ongoing, and finalized service operations across the entire facility."
              : "Mission control for your assigned tasks. Execute and monitor your active and upcoming detailing jobs."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-900 font-bold text-sm tracking-tight">
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-2xl border border-dashed border-gray-300">
            <Loader2 size={40} className="animate-spin text-red-600" />
            <div className="text-center">
              <p className="text-gray-900 font-black text-lg">
                Synchronizing Registry...
              </p>
              <p className="text-gray-400 text-xs mt-1 uppercase font-bold tracking-widest">
                Awaiting Secure Link
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-8">
            <TabsList className="bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200 inline-flex">
              <TabsTrigger
                value="upcoming"
                className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
              >
                Upcoming [{pendingServices.length}]
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
              >
                Active [{inProgressServices.length}]
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
              >
                Finalized [{completedServices.length}]
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="upcoming"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {pendingServices.length > 0 ? (
                pendingServices.map((service) => (
                  <ServiceCard key={service.bookingid} service={service} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <Calendar size={48} className="mx-auto text-gray-100 mb-4" />
                  <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">
                    No Pending Missions
                  </h3>
                  <p className="text-gray-400 text-sm mt-2">
                    The service queue is currently clear.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="in-progress"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {inProgressServices.length > 0 ? (
                inProgressServices.map((service) => (
                  <ServiceCard key={service.bookingid} service={service} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <Wrench size={48} className="mx-auto text-gray-100 mb-4" />
                  <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">
                    No Active Jobs
                  </h3>
                  <p className="text-gray-400 text-sm mt-2">
                    No detailing missions are currently in terminal.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="completed"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {completedServices.length > 0 ? (
                completedServices.map((service) => (
                  <ServiceCard key={service.bookingid} service={service} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <Calendar size={48} className="mx-auto text-gray-100 mb-4" />
                  <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">
                    Archives Empty
                  </h3>
                  <p className="text-gray-400 text-sm mt-2">
                    No completed service records found.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AllBookingsPage;
