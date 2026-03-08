import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  CheckCircle,
  User,
  Briefcase,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getBookings, updateBooking } from "@/services/booking.service";
import { getAvailableEmployees } from "@/services/employee.service";
import { COLORS } from "@/lib/colors";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

const ReassignModal = ({ booking, onClose, onConfirm }) => {
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const date = new Date(booking.bookingdate).toISOString().split("T")[0];
        const employees = await getAvailableEmployees(
          date,
          booking.bookingstarttime,
          booking.bookingendtime,
        );
        // Filter out the currently assigned employee by name
        const filteredEmployees = employees.filter(
          (emp) => emp.empname !== booking.assigned_empname
        );
        setAvailableEmployees(filteredEmployees);
      } catch (err) {
        console.error("Availability check failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [booking]);

  const handleSave = () => {
    if (!selectedEmp) return;
    onConfirm(selectedEmp);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-lg font-bold">Reassign Booking</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer Preference:</span>
              <span className="font-semibold text-gray-900">
                {booking.preferred_empname || "No Preference"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Currently Assigned:</span>
              <span className="font-semibold text-gray-900">
                {booking.assigned_empname || "Unassigned"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select New Employee</label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" /> Checking
                availability...
              </div>
            ) : (
              <select
                className="w-full border rounded-lg p-2 bg-white"
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
              >
                <option value="">-- Select Available Employee --</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.empid} value={emp.empid}>
                    {emp.empname} ({emp.emptype})
                  </option>
                ))}
              </select>
            )}
            {availableEmployees.length === 0 && !loading && (
              <p className="text-xs text-red-500">
                No other employees available for this slot.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!selectedEmp}
          >
            Confirm Reassignment
          </Button>
        </div>
      </div>
    </div>
  );
};

const BookingReviewPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      // Filter active bookings (pending or inProgress)
      const active = data.filter((b) =>
        ["pending", "inProgress"].includes(b.bookingstatus),
      );
      setBookings(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openReassign = (booking) => {
    setSelectedBooking(booking);
    setShowReassignModal(true);
  };

  const handleReassignmentConfirm = async (newEmpId) => {
    try {
      await updateBooking(selectedBooking.bookingid, {
        employeeId: newEmpId,
      });
      setShowReassignModal(false);
      fetchBookings(); // Refresh list
      toast.success("Employee reassigned successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reassign employee", {
        description: "Please try again later",
      });
    }
  };

  useSetPageHeader(
    "Booking Administration",
    "Booking Review",
    "Manage assignments and review customer preferences.",
    <Button
      onClick={fetchBookings}
      variant="outline"
      size="sm"
      className="gap-2 bg-white h-10 px-4 rounded-lg shadow-sm"
    >
      <RefreshCw size={16} /> Refresh
    </Button>
  );

  if (loading) return <PageLoader message="Loading bookings..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card
              key={booking.bookingid}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      BK-{String(booking.bookingid).padStart(4, "0")}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border ${booking.bookingstatus === "pending"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}
                    >
                      {booking.bookingstatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(
                      booking.bookingdate,
                    ).toLocaleDateString()} • {booking.bookingstarttime} -{" "}
                    {booking.bookingendtime}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.vehbrand} {booking.vehmodel}{" "}
                    <span className="text-gray-400">|</span> {booking.cusname}
                  </p>
                </div>

                <div className="flex items-center gap-6 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Preference
                    </p>
                    <p
                      className={`text-sm font-semibold ${booking.preferred_empname ? "text-gray-900" : "text-gray-400 italic"}`}
                    >
                      {booking.preferred_empname || "Any"}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Assigned
                    </p>
                    <p className="text-sm font-semibold text-blue-700">
                      {booking.assigned_empname || "Unassigned"}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => openReassign(booking)}
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400"
                >
                  <Briefcase size={16} className="mr-2" />
                  Reassign
                </Button>
              </CardContent>
            </Card>
          ))}
          {bookings.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              No active bookings to review.
            </p>
          )}
        </div>

        {showReassignModal && selectedBooking && (
          <ReassignModal
            booking={selectedBooking}
            onClose={() => setShowReassignModal(false)}
            onConfirm={handleReassignmentConfirm}
          />
        )}
      </div>
    </div>
  );
};

export default BookingReviewPage;
