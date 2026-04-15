import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  Briefcase,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { getBookings, updateBooking } from "@/services/booking.service";
import { getAvailableEmployees } from "@/services/employee.service";
import DataTable from "@/components/common/DataTable";
import PageToolbar from "@/components/common/PageToolbar";
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
          (emp) => emp.empname !== booking.assigned_empname,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();

  const fetchBookings = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      // Filter active bookings (pending or inProgress)
      const active = data.filter((b) =>
        ["pending", "inProgress"].includes(b.bookingstatus),
      );

      setBookings(active);

      const searchId = searchParams.get("search");
      if (searchId) {
        setSearchQuery(searchId);
        const matchedBooking = active.find(
          (booking) => String(booking.bookingid) === searchId,
        );

        if (matchedBooking) {
          setSelectedBooking(matchedBooking);
          setShowReassignModal(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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

  // Memoize action button for stable reference
  const headerAction = React.useMemo(
    () => (
      <Button
        onClick={fetchBookings}
        variant="outline"
        size="sm"
        className="gap-2 bg-white h-10 px-4 rounded-lg shadow-sm border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-semibold uppercase tracking-wide"
      >
        <RefreshCw size={16} /> Refresh
      </Button>
    ),
    [fetchBookings],
  );

  const filteredBookings = bookings.filter((booking) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        booking.bookingid,
        booking.cusname,
        booking.vehbrand,
        booking.vehmodel,
        booking.assigned_empname,
        booking.preferred_empname,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );

    return matchesSearch;
  });

  const toolbar = React.useMemo(
    () => (
      <PageToolbar
        stats={[
          {
            icon: Calendar,
            label: "Total",
            value: bookings.length,
            iconClassName: "text-gray-500",
          },
          {
            icon: Briefcase,
            label: "Pending",
            value: bookings.filter(
              (booking) => booking.bookingstatus === "pending",
            ).length,
            iconClassName: "text-amber-500",
          },
          {
            icon: Clock,
            label: "In Progress",
            value: bookings.filter(
              (booking) => booking.bookingstatus === "inProgress",
            ).length,
            iconClassName: "text-blue-500",
          },
          {
            icon: CheckCircle,
            label: "Unassigned",
            value: bookings.filter((booking) => !booking.assigned_empname)
              .length,
            iconClassName: "text-green-500",
          },
        ]}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search bookings..."
      />
    ),
    [bookings, searchQuery],
  );

  useSetPageHeader(
    "Booking Administration",
    "Booking Review",
    "Manage assignments and review customer preferences.",
    headerAction,
    toolbar,
  );

  if (loading) return <PageLoader message="Loading bookings..." />;

  const columns = [
    {
      key: "bookingid",
      label: "ID",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-gray-500 text-sm">
            #{String(row.bookingid).padStart(4, "0")}
          </span>
          <span
            className={`w-fit text-[8px] px-1.5 py-0.5 rounded-full uppercase font-black border mt-1 ${
              row.bookingstatus === "pending"
                ? "bg-amber-50 text-amber-600 border-amber-100"
                : "bg-blue-50 text-blue-600 border-blue-100"
            }`}
          >
            {row.bookingstatus}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer & Vehicle",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm">{row.cusname}</span>
          <span className="text-xs text-gray-500 font-medium">
            {row.vehbrand} {row.vehmodel}
          </span>
        </div>
      ),
    },
    {
      key: "schedule",
      label: "Date & Time",
      render: (row) => (
        <div className="flex flex-col text-sm text-gray-600 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-400" />
            {new Date(row.bookingdate).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-400 font-normal">
            {row.bookingstarttime} - {row.bookingendtime}
          </span>
        </div>
      ),
    },
    {
      key: "preference",
      label: "Preferences",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
            Preferred
          </span>
          <span
            className={`text-sm font-semibold ${
              row.preferred_empname ? "text-gray-900" : "text-gray-300 italic"
            }`}
          >
            {row.preferred_empname || "None"}
          </span>
        </div>
      ),
    },
    {
      key: "assigned",
      label: "Assigned",
      render: (row) => (
        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {row.assigned_empname || "Unassigned"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <Button
          onClick={() => openReassign(row)}
          variant="outline"
          size="sm"
          className="h-8 text-[10px] font-black uppercase border-gray-200 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors"
        >
          <Briefcase size={12} className="mr-1.5" />
          Reassign
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <DataTable
        columns={columns}
        data={filteredBookings}
        keyField="bookingid"
        emptyIcon={CheckCircle}
        emptyTitle="No active bookings to review."
        emptySubtitle={
          searchQuery
            ? "No bookings match your search."
            : "Pending and in-progress bookings will appear here."
        }
      />

      {showReassignModal && selectedBooking && (
        <ReassignModal
          booking={selectedBooking}
          onClose={() => setShowReassignModal(false)}
          onConfirm={handleReassignmentConfirm}
        />
      )}
    </div>
  );
};

export default BookingReviewPage;
