import React, { useState } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock assigned services data
const mockAssignedServices = [
  {
    id: "1",
    bookingId: "BK-2025-001",
    status: "scheduled",
    date: "2025-12-31",
    time: "10:00 AM",
    customer: { name: "John Doe", phone: "+94 77 123 4567" },
    vehicle: {
      brand: "Toyota",
      model: "Corolla",
      plate: "ABC-123",
      nickname: "Daily",
      currentMileage: "45,000",
    },
    services: ["Exterior Wash", "Interior Detailing"],
    location: "Main Branch - Pannipitiya",
    estimatedDuration: "90 mins",
  },
  {
    id: "2",
    bookingId: "BK-2025-002",
    status: "in-progress",
    date: "2025-12-30",
    time: "2:00 PM",
    customer: { name: "Sarah Smith", phone: "+94 77 987 6543" },
    vehicle: {
      brand: "Honda",
      model: "Civic",
      plate: "XYZ-789",
      nickname: "Workhorse",
      currentMileage: "62,000",
    },
    services: ["Full Service Detail"],
    location: "Home Visit",
    estimatedDuration: "180 mins",
  },
  {
    id: "3",
    bookingId: "BK-2025-003",
    status: "scheduled",
    date: "2026-01-02",
    time: "9:00 AM",
    customer: { name: "Michael Brown", phone: "+94 77 555 1234" },
    vehicle: {
      brand: "Ford",
      model: "F-150",
      plate: "TRK-555",
      nickname: "Hauler",
      currentMileage: "28,000",
    },
    services: ["Oil Change", "Tire & Wheel Care"],
    location: "Main Branch - Pannipitiya",
    estimatedDuration: "60 mins",
  },
  {
    id: "4",
    bookingId: "BK-2025-004",
    status: "completed",
    date: "2025-12-28",
    time: "11:00 AM",
    customer: { name: "Emma Wilson", phone: "+94 77 321 9876" },
    vehicle: {
      brand: "Nissan",
      model: "Altima",
      plate: "DEF-456",
      nickname: null,
      currentMileage: "35,500",
    },
    services: ["Engine Bay Clean", "Exterior Wash"],
    location: "Main Branch - Pannipitiya",
    estimatedDuration: "120 mins",
  },
];

const StatusBadge = ({ status }) => {
  const styles = {
    scheduled: "bg-blue-100 text-blue-800 border-blue-300",
    "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-300",
    completed: "bg-green-100 text-green-800 border-green-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status === "in-progress"
        ? "In Progress"
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ServiceCard = ({ service }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link to={`/dashboard/employee/service/${service.id}`}>
      <Card className="transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">
                  {service.vehicle.nickname ||
                    `${service.vehicle.brand} ${service.vehicle.model}`}
                </CardTitle>
                <StatusBadge status={service.status} />
              </div>
              <p className="text-sm text-gray-600">{service.bookingId}</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-gray-800">{service.customer.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Car size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-gray-800">{service.vehicle.plate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-gray-800">{formatDate(service.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-gray-800">
                {service.time} • {service.estimatedDuration}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-gray-800">{service.location}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Wrench
                size={16}
                className="text-gray-500 mt-0.5 flex-shrink-0"
              />
              <span className="text-gray-800">
                {service.services.join(", ")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const AssignedServicesPage = () => {
  const [services] = useState(mockAssignedServices);

  const scheduledServices = services.filter((s) => s.status === "scheduled");
  const inProgressServices = services.filter((s) => s.status === "in-progress");
  const completedServices = services.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Employee Portal
          </p>
          <h1 className="text-3xl font-bold">Assigned Services</h1>
          <p className="text-gray-600">
            View and manage your assigned service appointments.
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({scheduledServices.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressServices.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedServices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {scheduledServices.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scheduledServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No upcoming services
                  </h3>
                  <p className="text-gray-600">
                    You don't have any scheduled services at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            {inProgressServices.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inProgressServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No services in progress
                  </h3>
                  <p className="text-gray-600">
                    Services you're currently working on will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedServices.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No completed services
                  </h3>
                  <p className="text-gray-600">
                    Your completed services will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AssignedServicesPage;
