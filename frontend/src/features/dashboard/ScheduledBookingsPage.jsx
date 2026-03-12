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
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getBookings,
  updateBooking,
  deleteBooking,
} from "@/services/booking.service";
import { COLORS } from "@/lib/colors";
import { toast } from "sonner";
import { formatDateShortSL } from "@/lib/dateFormat";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    inProgress: "bg-blue-50 text-blue-700 border-blue-100",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cancelled: "bg-gray-50 text-gray-700 border-gray-100",
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

const BookingCard = ({ booking, onManage }) => {
  // Format services list
  const servicesList = booking.services
    ? booking.services.map((s) => s.servicename).join(", ")
    : "No services selected";

  // Data mapping from backend
  const vehicleName = booking.vehbrand
    ? `${booking.vehbrand} ${booking.vehmodel}`
    : `Vehicle ID: ${booking.vehid}`;

  const plate = booking.vehplate || "";
  const location = "Main Branch - Pannipitiya";
  const employee = booking.assigned_empname || "Assigned on arrival";

  // Calculate total price
  const totalPrice = booking.totalprice || booking.bookingtotalprice || 0;

  const formattedTotalPrice =
    totalPrice > 0 ? `Rs. ${Number(totalPrice).toLocaleString()}` : "---";

  return (
    <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Decorative Color Ribbon */}
      {booking.vehcolor && (
        <div
          className="absolute top-0 right-0 w-10 h-10 pointer-events-none z-10"
          style={{
            background: `linear-gradient(225deg, ${booking.vehcolor} 50%, transparent 50%)`,
            opacity: 0.8,
          }}
        />
      )}
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
              {formatDateShortSL(booking.bookingdate)}
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
            onClick={() => onManage(booking)}
            className="border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-600 transition-colors font-bold gap-2"
          >
            <Edit2 size={14} />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EditBookingModal = ({ booking, isOpen, onClose, onUpdate, onCancel }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (booking) {
      setDate(new Date(booking.bookingdate).toISOString().split("T")[0]);
      setTime(booking.bookingstarttime);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const isPending = booking.bookingstatus === "pending";

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(booking.bookingid, { date, startTime: time });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const confirmed = await confirm({
      variant: "destructive",
      title: "Cancel Booking?",
      description:
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      confirmText: "Cancel Booking",
      cancelText: "Keep Booking",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await onCancel(booking.bookingid);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden scale-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Manage Booking</h3>
            <p className="text-sm text-gray-500">
              Service #{booking.bookingid}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Alert */}
          {!isPending && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex gap-2">
              <AlertCircle size={16} className="mt-0.5" />
              <p>
                This booking is <strong>{booking.bookingstatus}</strong>. Only
                pending bookings can be modified.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={!isPending || isLoading}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Time</label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={!isPending || isLoading}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          {isPending && (
            <Button
              variant="destructive"
              variantType="outline"
              onClick={handleCancelBooking}
              disabled={isLoading}
              className="mr-auto text-red-600 border-red-200 hover:bg-red-50 gap-2"
            >
              <Trash2 size={16} />
              Cancel Booking
            </Button>
          )}

          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Close
          </Button>

          {isPending && (
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

const ScheduledBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data || []);
    } catch (err) {
      toast.error("Failed to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await updateBooking(id, updates);
      fetchBookings();
      toast.success("Booking updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking", {
        description: "Please try again later",
      });
    }
  };

  const handleCancel = async (id) => {
    try {
      await deleteBooking(id);
      fetchBookings();
      toast.success("Booking cancelled successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel booking", {
        description: "Please try again later",
      });
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.bookingstatus === "pending" || b.bookingstatus === "inProgress",
  );

  // Memoize action button for stable reference
  const headerAction = React.useMemo(() => (
    <Link to="/dashboard/book">
      <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold">
        Book New Service
      </Button>
    </Link>
  ), []);

  useSetPageHeader(
    "Bookings",
    "My Bookings",
    "Manage your upcoming service appointments.",
    headerAction,
  );

  if (loading) return <PageLoader message="Loading bookings..." />;

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-semibold">
              Upcoming ({upcomingBookings.length})
            </h2>
          </div>

          {upcomingBookings.length > 0 ? (
            <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Reference
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Vehicle
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Services
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {upcomingBookings.map((booking) => {
                      const vehicleName = booking.vehbrand
                        ? `${booking.vehbrand} ${booking.vehmodel}`
                        : `Vehicle ID: ${booking.vehid}`;
                      const plate = booking.vehplate || "";
                      const servicesList = booking.services
                        ? booking.services.map((s) => s.servicename).join(", ")
                        : "No services";
                      const totalPrice = booking.totalprice || booking.bookingtotalprice || 0;

                      return (
                        <tr
                          key={booking.bookingid}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-bold text-gray-600">
                              #{booking.bookingid}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 leading-tight">
                                {vehicleName}
                              </span>
                              <span className="text-[10px] font-mono text-gray-500 italic">
                                {plate}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                <Calendar size={12} className="text-red-600" />
                                {formatDateShortSL(booking.bookingdate)}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                                <Clock size={12} className="text-gray-400" />
                                {booking.bookingstarttime} - {booking.bookingendtime}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-600 font-medium line-clamp-1 max-w-[200px]" title={servicesList}>
                              {servicesList}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-sm font-black ${COLORS.text.brand}`}>
                              Rs. {Number(totalPrice).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={booking.bookingstatus} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                              className="h-8 text-[11px] font-black uppercase text-gray-400 hover:text-red-600 hover:bg-red-50 p-2"
                            >
                              Manage
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

      <EditBookingModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
      />
    </>
  );
};

export default ScheduledBookingsPage;
