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
  History,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getBookings } from "@/services/booking.service";
import { COLORS } from "@/lib/colors";
import { formatDateShortSL } from "@/lib/dateFormat";
import { toast } from "sonner";

const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cancelled: "bg-gray-50 text-gray-700 border-gray-100",
  };

  const labels = {
    completed: "Completed",
    paid: "Paid",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}
    >
      {(status === "completed" || status === "paid") && (
        <CheckCircle size={12} />
      )}
      {status === "cancelled" && <XCircle size={12} />}
      {labels[status] || status}
    </span>
  );
};

const HistoryCard = ({ booking }) => {
  // Improved null checking for services with property name fallbacks
  const servicesList =
    booking.services &&
    Array.isArray(booking.services) &&
    booking.services.length > 0
      ? booking.services
          .map((s) => s.servicename || s.serviceName || "Unknown Service")
          .join(", ")
      : "Services not available";

  const vehicleName = booking.vehbrand
    ? `${booking.vehbrand} ${booking.vehmodel}`
    : `Vehicle ID: ${booking.vehid}`;

  const plate = booking.vehplate || "";
  const location = "Main Branch - Pannipitiya";
  const employee = booking.assigned_employee || "Service Team";

  // Use totalprice from booking (already calculated at booking time)
  const totalPrice = Number(booking.totalprice) || 0;

  const formattedTotalPrice =
    totalPrice > 0 ? `Rs. ${totalPrice.toLocaleString()}` : "---";

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
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
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Wrench
              size={16}
              className={`${COLORS.icon.brand} mt-0.5 flex-shrink-0`}
            />
            <span>{servicesList}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Calendar
              size={16}
              className={`${COLORS.icon.brand} mt-0.5 flex-shrink-0`}
            />
            <span>{formatDateShortSL(booking.bookingdate)}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <User
              size={16}
              className={`${COLORS.icon.brand} mt-0.5 flex-shrink-0`}
            />
            <span>{employee}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-bold">
              Total Paid
            </span>
            <span className={`text-lg font-bold ${COLORS.text.brand}`}>
              {formattedTotalPrice}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-600 font-bold"
          >
            View Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ServiceHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getBookings();
        setBookings(data || []);
      } catch (err) {
        toast.error("Failed to load your service history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const historyBookings = bookings.filter(
    (b) => b.bookingstatus === "completed" || b.bookingstatus === "paid",
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
        <div className="space-y-2">
          <p
            className={`text-sm uppercase tracking-wide ${COLORS.text.brand} font-semibold`}
          >
            Activity Logs
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Service History</h1>
          <p className="text-gray-500">
            A record of all your past vehicle maintenance and detailing.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History size={20} className={COLORS.text.brand} />
              Past Services ({historyBookings.length})
            </h2>
          </div>

          {historyBookings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {historyBookings.map((booking) => (
                <HistoryCard key={booking.bookingid} booking={booking} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-white">
              <CardContent className="text-center py-20">
                <History size={64} className="mx-auto text-gray-200 mb-6" />
                <h3 className="text-2xl font-bold mb-2">No past services</h3>
                <p className={`${COLORS.text.secondary} max-w-sm mx-auto mb-8`}>
                  Once you complete a service with us, it will appear here for
                  your records.
                </p>
                <Link to="/dashboard/book">
                  <Button className={COLORS.bg.brand}>
                    Book Your First Service
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

export default ServiceHistoryPage;
