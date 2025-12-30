import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Car,
  Wrench,
  User,
  DollarSign,
  CheckCircle,
} from "lucide-react";

// Mock service history data
const mockServiceHistory = [
  {
    id: "1",
    date: "2025-12-28",
    vehicle: {
      brand: "Ford",
      model: "F-150",
      plate: "TRK-555",
      nickname: "Hauler",
    },
    services: ["Oil Change", "Tire & Wheel Care"],
    location: "Main Branch - Pannipitiya",
    employee: "Sarah Fernando",
    totalCost: "$75",
    status: "completed",
  },
  {
    id: "2",
    date: "2025-12-15",
    vehicle: {
      brand: "Toyota",
      model: "Corolla",
      plate: "ABC-123",
      nickname: "Daily",
    },
    services: ["Exterior Wash", "Interior Detailing"],
    location: "Main Branch - Pannipitiya",
    employee: "John Silva",
    totalCost: "$80",
    status: "completed",
  },
  {
    id: "3",
    date: "2025-12-05",
    vehicle: {
      brand: "Honda",
      model: "Civic",
      plate: "XYZ-789",
      nickname: "Workhorse",
    },
    services: ["Full Service Detail"],
    location: "Home Visit",
    employee: "Michael Perera",
    totalCost: "$120",
    status: "completed",
  },
  {
    id: "4",
    date: "2025-11-20",
    vehicle: {
      brand: "Toyota",
      model: "Corolla",
      plate: "ABC-123",
      nickname: "Daily",
    },
    services: ["Engine Bay Clean", "Exterior Wash"],
    location: "Main Branch - Pannipitiya",
    employee: "Amara Jayasinghe",
    totalCost: "$90",
    status: "completed",
  },
];

const ServiceHistoryCard = ({ service }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {service.vehicle.nickname ||
                `${service.vehicle.brand} ${service.vehicle.model}`}
            </CardTitle>
            <p className="text-sm text-gray-600">{service.vehicle.plate}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
            <CheckCircle size={12} />
            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Calendar
              size={16}
              className="text-gray-500 mt-0.5 flex-shrink-0"
            />
            <span className="text-gray-800">{formatDate(service.date)}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{service.location}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <User size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{service.employee}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Wrench size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{service.services.join(", ")}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-gray-600">Total Cost</span>
          <span className="text-lg font-bold text-blue-600">
            {service.totalCost}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const ServiceHistoryPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Service History
          </p>
          <h1 className="text-3xl font-bold">Your service history</h1>
          <p className="text-gray-600">
            View all completed services and maintenance records.
          </p>
        </div>

        {mockServiceHistory.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockServiceHistory.map((service) => (
              <ServiceHistoryCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No service history</h3>
              <p className="text-gray-600">
                Your completed services will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ServiceHistoryPage;
