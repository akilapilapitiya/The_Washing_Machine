import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Wrench,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock scheduled bookings data
const mockBookings = [
  {
    id: "1",
    status: "pending",
    vehicle: {
      make: "Toyota",
      model: "Corolla",
      plate: "ABC-123",
      nickname: "Daily",
    },
    services: ["Exterior Wash", "Interior Detailing"],
    location: "Main Branch - Pannipitiya",
    employee: "John Silva",
    date: "2025-12-31",
    time: "10:00 AM",
    totalPrice: "$80",
  },
  {
    id: "2",
    status: "confirmed",
    vehicle: {
      make: "Honda",
      model: "Civic",
      plate: "XYZ-789",
      nickname: "Workhorse",
    },
    services: ["Full Service Detail"],
    location: "Home Visit",
    employee: "Any Employee",
    date: "2026-01-02",
    time: "2:00 PM",
    totalPrice: "$120",
  },
  {
    id: "3",
    status: "completed",
    vehicle: {
      make: "Ford",
      model: "F-150",
      plate: "TRK-555",
      nickname: "Hauler",
    },
    services: ["Oil Change", "Tire & Wheel Care"],
    location: "Main Branch - Pannipitiya",
    employee: "Sarah Fernando",
    date: "2025-12-28",
    time: "11:00 AM",
    totalPrice: "$75",
  },
];

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status === "completed" && <CheckCircle size={12} />}
      {status === "cancelled" && <XCircle size={12} />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const BookingCard = ({ booking }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {booking.vehicle.nickname ||
                `${booking.vehicle.make} ${booking.vehicle.model}`}
            </CardTitle>
            <p className="text-sm text-gray-600">{booking.vehicle.plate}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Wrench size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{booking.services.join(", ")}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{booking.location}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <User size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{booking.employee}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Calendar
              size={16}
              className="text-gray-500 mt-0.5 flex-shrink-0"
            />
            <span className="text-gray-800">
              {new Date(booking.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Clock size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-800">{booking.time}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-lg font-bold text-blue-600">
            {booking.totalPrice}
          </span>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ScheduledBookingsPage = () => {
  const pendingBookings = mockBookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const completedBookings = mockBookings.filter(
    (b) => b.status === "completed"
  );
  const cancelledBookings = mockBookings.filter(
    (b) => b.status === "cancelled"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-600">
            View and manage your service appointments.
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {pendingBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No upcoming bookings
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any scheduled appointments yet.
                  </p>
                  <Link to="/dashboard/book">
                    <Button>Book a Service</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2">
                    No completed bookings
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

export default ScheduledBookingsPage;
