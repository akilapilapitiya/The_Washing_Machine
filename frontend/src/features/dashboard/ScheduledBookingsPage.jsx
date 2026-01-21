import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Wrench,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getBookings } from "@/services/booking.service";
import { COLORS } from "@/lib/colors";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    inProgress: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    paid: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  const labels = {
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    paid: "Paid",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}
    >
      {(status === "completed" || status === "paid") && (
        <CheckCircle size={12} />
      )}
      {status === "cancelled" && <XCircle size={12} />}
      {labels[status] || status}
    </span>
  );
};

const BookingCard = ({ booking }) => {
  // Format services list
  const servicesList = booking.services
    ? booking.services.map((s) => s.serviceName).join(", ")
    : "No services selected";

  // Data mapping from backend
  const vehicleName = booking.vehbrand
    ? `${booking.vehbrand} ${booking.vehmodel}`
    : `Vehicle ID: ${booking.vehid}`;

  const plate = booking.vehplate || "";
  const location = "Main Branch - Pannipitiya"; // Fallback as location is just lat/long in DB
  const employee = booking.assigned_employee || "Assigned on arrival";

  // Calculate total price (using fallback RS 0 for now as pricing might not be in basic query)
  const totalPrice = booking.services
    ? booking.services.reduce(
        (sum, s) => sum + (Number(s.servicePrice) || 0),
        0,
      )
    : 0;

  const formattedTotalPrice =
    totalPrice > 0 ? `Rs. ${totalPrice.toLocaleString()}` : "---";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{vehicleName}</CardTitle>
            <p className={`text-sm ${COLORS.text.secondary}`}>{plate}</p>
          </div>
          <StatusBadge status={booking.bookingstatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Wrench
              size={16}
              className={`${COLORS.icon.brand} mt-0.5 flex-shrink-0`}
            />
            <span className={COLORS.text.primary}>{servicesList}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin
              size={16}
              className={`${COLORS.icon.brand} mt-0.5 flex-shrink-0`}
            />
            <span className={COLORS.text.primary}>{location}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <User
              size={16}
              className={`${COLORS.icon.brand} mt-0.5 flex-shrink-0`}
            />
            <span className={COLORS.text.primary}>{employee}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Calendar
              size={16}
              className={`${COLORS.icon.brand} mt-0.5 flex-shrink-0`}
            />
            <span className={COLORS.text.primary}>
              {new Date(booking.bookingdate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Clock
              size={16}
              className={`${COLORS.icon.brand} mt-0.5 flex-shrink-0`}
            />
            <span className={COLORS.text.primary}>
              {booking.bookingstarttime} - {booking.bookingendtime}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className={`text-lg font-bold ${COLORS.text.brand}`}>
            {formattedTotalPrice}
          </span>
          <Button
            variant="outline"
            size="sm"
            className={`border-gray-200 hover:border-red-600 hover:text-red-600 transition-colors`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ScheduledBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getBookings();
        setBookings(data || []);
      } catch (err) {
        setError("Failed to load your bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const upcomingBookings = bookings.filter(
    (b) => b.bookingstatus === "pending" || b.bookingstatus === "inProgress",
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className={`h-12 w-12 animate-spin ${COLORS.icon.brand}`} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className={COLORS.text.secondary}>
              Manage your upcoming service appointments.
            </p>
          </div>
          <Link to="/dashboard/book">
            <Button className={`${COLORS.bg.brand} w-full md:w-auto`}>
              Book New Service
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-semibold">
              Upcoming ({upcomingBookings.length})
            </h2>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.bookingid} booking={booking} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="text-center py-16">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold mb-2">No upcoming bookings</h3>
                <p className={`${COLORS.text.secondary} mb-6`}>
                  You don't have any scheduled appointments at the moment.
                </p>
                <Link to="/dashboard/book">
                  <Button className={COLORS.bg.brand}>
                    Schedule Your First Wash
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduledBookingsPage;
