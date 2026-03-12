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
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

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

  useSetPageHeader(
    "Activity Logs",
    "Service History",
    "A record of all your past vehicle maintenance and detailing.",
  );

  if (loading) return <PageLoader message="Loading history..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="space-y-6">

        {historyBookings.length > 0 ? (
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Service / Vehicle
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Services
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {historyBookings.map((booking) => {
                    const vehicleName = booking.vehbrand
                      ? `${booking.vehbrand} ${booking.vehmodel}`
                      : `Vehicle ID: ${booking.vehid}`;
                    const plate = booking.vehplate || "";
                    const servicesList =
                      booking.services &&
                      Array.isArray(booking.services) &&
                      booking.services.length > 0
                        ? booking.services
                            .map((s) => s.servicename || s.serviceName || "Unknown")
                            .join(", ")
                        : "---";
                    const employee = booking.assigned_employee || "Service Team";
                    const totalPrice = Number(booking.totalprice) || 0;

                    return (
                      <tr
                        key={booking.bookingid}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 leading-tight">
                              {vehicleName}
                            </span>
                            <span className="text-xs text-gray-500 font-mono italic">
                              {plate}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                          {formatDateShortSL(booking.bookingdate)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-600 font-medium line-clamp-1 max-w-[200px]" title={servicesList}>
                            {servicesList}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                              {employee.charAt(0)}
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                              {employee}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={booking.bookingstatus} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-black ${COLORS.text.brand}`}>
                            Rs. {totalPrice.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[11px] font-black uppercase text-gray-400 hover:text-red-600 hover:bg-red-50 p-2"
                          >
                            Receipt
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
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
    
  );
};

export default ServiceHistoryPage;

// End of file
