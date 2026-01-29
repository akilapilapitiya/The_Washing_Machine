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
} from "lucide-react";
import { Link } from "react-router-dom";
import * as bookingService from "@/services/booking.service";
import { formatDateShortSL } from "@/lib/dateFormat";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-gray-100 text-gray-800 border-gray-300",
    inProgress: "bg-red-50 text-red-700 border-red-200",
    completed: "bg-green-100 text-green-800 border-green-300",
  };

  const labels = {
    pending: "Scheduled",
    inProgress: "In Progress",
    completed: "Completed",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}
    >
      {labels[status] || status}
    </span>
  );
};

const ServiceCard = ({ service }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return formatDateShortSL(dateString);
  };

  return (
    <Link to={`/dashboard/employee/service/${service.bookingid}`}>
      <Card className="transition hover:shadow-md hover:border-red-200 cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-bold">
                  {service.vehbrand} {service.vehmodel}
                </CardTitle>
                <StatusBadge status={service.bookingstatus} />
              </div>
              <p className="text-xs font-mono text-gray-500">
                ID: {service.bookingid}
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-400 mt-1" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={14} className="flex-shrink-0" />
              <span className="font-medium text-gray-900">
                {service.cusname || "Unknown Customer"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Car size={14} className="flex-shrink-0" />
              <span className="font-mono text-gray-900">
                {service.vehplate}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} className="flex-shrink-0" />
              <span>{formatDate(service.bookingdate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} className="flex-shrink-0" />
              <span>
                {service.bookingstarttime} - {service.bookingendtime}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2 text-sm">
              <Wrench size={14} className="text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {service.services && service.services.length > 0 ? (
                  service.services.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-700"
                    >
                      {s.serviceName}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No services listed</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const AssignedServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignedServices();
  }, []);

  const fetchAssignedServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookings();
      setServices(data || []);
    } catch (err) {
      console.error("Failed to fetch assigned services:", err);
      setError("Failed to synchronize task queue. Please re-authenticate.");
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
    (s) => s.bookingstatus === "completed",
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Employee Portal
          </p>
          <h1 className="text-3xl font-bold">Assigned Services</h1>
          <p className="text-gray-600">
            View and manage your assigned detailing missions.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="animate-spin text-red-600" />
            <p className="text-gray-500 font-medium italic">
              Loading assignment logs...
            </p>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="bg-white border p-1 rounded-xl">
              <TabsTrigger
                value="upcoming"
                className="px-6 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Upcoming ({pendingServices.length})
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="px-6 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                In Progress ({inProgressServices.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="px-6 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                History ({completedServices.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {pendingServices.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingServices.map((service) => (
                    <ServiceCard key={service.bookingid} service={service} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 py-20">
                  <CardContent className="text-center space-y-4">
                    <Calendar size={48} className="mx-auto text-gray-200" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold">Queue Empty</h3>
                      <p className="text-gray-500">
                        No scheduled missions assigned to you yet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="space-y-4">
              {inProgressServices.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressServices.map((service) => (
                    <ServiceCard key={service.bookingid} service={service} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 py-20">
                  <CardContent className="text-center space-y-4">
                    <Wrench size={48} className="mx-auto text-gray-200" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold">No Active Jobs</h3>
                      <p className="text-gray-500">
                        Initialize a mission from the upcoming queue.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedServices.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedServices.map((service) => (
                    <ServiceCard key={service.bookingid} service={service} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 py-20">
                  <CardContent className="text-center space-y-4">
                    <Calendar size={48} className="mx-auto text-gray-200" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold">No History</h3>
                      <p className="text-gray-500">
                        Completed missions will be archived here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AssignedServicesPage;
