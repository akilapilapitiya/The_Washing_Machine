import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Car,
  Wrench,
  CheckCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Mock data for display
const mockVehicles = [
  {
    id: "1",
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    color: "Blue",
    plate: "ABC-123",
    nickname: "Daily",
  },
  {
    id: "2",
    make: "Honda",
    model: "Civic",
    year: 2019,
    color: "White",
    plate: "XYZ-789",
    nickname: "Workhorse",
  },
  {
    id: "3",
    make: "Ford",
    model: "F-150",
    year: 2022,
    color: "Gray",
    plate: "TRK-555",
    nickname: "Hauler",
  },
];

const mockServices = [
  { id: "1", title: "Exterior Wash", price: "$20" },
  { id: "2", title: "Interior Detailing", price: "$60" },
  { id: "3", title: "Full Service Detail", price: "$120" },
  { id: "4", title: "Oil Change", price: "$50" },
  { id: "5", title: "Tire & Wheel Care", price: "$25" },
  { id: "6", title: "Engine Bay Clean", price: "$70" },
];

const mockEmployees = [
  { id: "any", name: "Any Employee" },
  { id: "1", name: "John Silva" },
  { id: "2", name: "Sarah Fernando" },
  { id: "3", name: "Michael Perera" },
  { id: "4", name: "Amara Jayasinghe" },
];

const mockLocations = [
  {
    id: "main-branch",
    title: "The Washing Machine - Main Branch",
    address: "Pannipitiya, Colombo, Sri Lanka",
  },
  { id: "home-visit", title: "Home Visit", address: "We come to you" },
];

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { vehicleId, serviceIds, locationId, employeeId, date, time } =
    location.state || {};

  const selectedVehicle = mockVehicles.find((v) => v.id === vehicleId);
  const selectedServices = mockServices.filter((s) =>
    serviceIds?.includes(s.id)
  );
  const selectedEmployee = mockEmployees.find((e) => e.id === employeeId);
  const selectedLocation = mockLocations.find((l) => l.id === locationId);

  const handleConfirm = () => {
    // In real app, this would make an API call to create the booking
    // For now, just navigate to scheduled bookings
    navigate("/dashboard/bookings");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hour] = timeString.split(":");
    const hourNum = parseInt(hour);
    return hourNum < 12
      ? `${hourNum}:00 AM`
      : hourNum === 12
      ? `12:00 PM`
      : `${hourNum - 12}:00 PM`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle size={32} className="text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Review & Confirm</h1>
          <p className="text-gray-600">
            Please review your booking details before confirming.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Vehicle Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car size={20} className="text-blue-600" />
                Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVehicle ? (
                <div>
                  <p className="font-semibold text-lg">
                    {selectedVehicle.nickname ||
                      `${selectedVehicle.make} ${selectedVehicle.model}`}
                  </p>
                  <p className="text-gray-600">
                    {selectedVehicle.year} • {selectedVehicle.color} •{" "}
                    {selectedVehicle.plate}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No vehicle selected</p>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench size={20} className="text-blue-600" />
                Services ({selectedServices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{service.title}</span>
                    <span className="text-blue-600 font-semibold">
                      {service.price}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin size={20} className="text-blue-600" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLocation ? (
                <div>
                  <p className="font-semibold">{selectedLocation.title}</p>
                  <p className="text-gray-600 text-sm">
                    {selectedLocation.address}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No location selected</p>
              )}
            </CardContent>
          </Card>

          {/* Employee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User size={20} className="text-blue-600" />
                Preferred Employee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">
                {selectedEmployee?.name || "Not specified"}
              </p>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar size={20} className="text-blue-600" />
                Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="font-semibold">{formatDate(date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="font-semibold">{formatTime(time)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={handleConfirm} size="lg">
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
