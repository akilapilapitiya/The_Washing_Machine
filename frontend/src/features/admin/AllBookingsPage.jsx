import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import * as bookingService from "@/services/booking.service";
import { useAuth } from "@/contexts/AuthContext";

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

const ServiceCard = ({ service }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link to={`/dashboard/employee/service/${service.bookingid}`}>
      <Card className="hover:shadow-md transition-all border-gray-200 h-full group">
        <CardHeader className="pb-3 border-b border-gray-100 bg-white pt-5 px-5">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                {service.vehbrand} {service.vehmodel}
              </CardTitle>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {service.vehplate}
              </p>
            </div>
            <StatusBadge status={service.bookingstatus} />
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-gray-400" />
              <span className="font-medium text-gray-700">
                {service.cusname || "Unregistered Customer"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-gray-600">
                {formatDate(service.bookingdate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-gray-400" />
              <span className="text-gray-600">
                {service.bookingstarttime} - {service.bookingendtime}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-gray-100">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Wrench size={14} className="text-gray-400 mt-0.5" />
                <div className="flex flex-wrap gap-1.5">
                  {service.services && service.services.length > 0 ? (
                    service.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-50 px-2 py-0.5 rounded text-[11px] font-medium text-gray-600 border border-gray-100"
                      >
                        {s.serviceName}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">
                      Standard Service
                    </span>
                  )}
                </div>
              </div>

              {service.assigned_empname && (
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Briefcase size={12} className="text-gray-400" />
                  <span>Assigned: {service.assigned_empname}</span>
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
  const { isOwner, isCashier } = useAuth();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      toast.error(null);
      const data = await bookingService.getBookings();
      setServices(data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      toast.error("Unable to load bookings.");
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
      <div className="container mx-auto px-4 py-12 space-y-8 max-w-7xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isOwner || isCashier ? "Service Bookings" : "My Assignments"}
          </h1>
          <p className="text-gray-500">
            {isOwner || isCashier
              ? "Manage all bookings, view status, and assign tasks."
              : "View your upcoming and active service tasks."}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={32} className="animate-spin text-red-600" />
            <p className="text-sm font-medium text-gray-500">
              Loading bookings...
            </p>
          </div>
        ) : (
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
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {pendingServices.length > 0 ? (
                pendingServices.map((service) => (
                  <ServiceCard key={service.bookingid} service={service} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
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
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {inProgressServices.length > 0 ? (
                inProgressServices.map((service) => (
                  <ServiceCard key={service.bookingid} service={service} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
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
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {completedServices.length > 0 ? (
                completedServices.map((service) => (
                  <ServiceCard key={service.bookingid} service={service} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
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
        )}
      </div>
    </div>
  );
};

export default AllBookingsPage;
