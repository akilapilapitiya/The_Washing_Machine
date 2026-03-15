import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, History, Hash, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getBookings } from "@/services/booking.service";
import { formatDateShortSL } from "@/lib/dateFormat";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import PageToolbar from "@/components/common/PageToolbar";

const ServiceHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getBookings();
        setBookings(data || []);
      } catch {
        toast.error("Failed to load your service history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const historyBookings = bookings.filter(
    (b) =>
      b.bookingstatus === "completed" ||
      b.bookingstatus === "paid" ||
      b.bookingstatus === "cancelled",
  );

  const filteredBookings = historyBookings.filter((booking) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        booking.vehbrand,
        booking.vehmodel,
        booking.services?.map((s) => s.servicename).join(" "),
      ].some((value) => String(value || "").toLowerCase().includes(query));

    return matchesSearch;
  });

  const toolbar = React.useMemo(
    () => (
      <PageToolbar
        stats={[
          { icon: History, label: "Total", value: historyBookings.length, iconClassName: "text-gray-500" },
        ]}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by vehicle or service..."
      />
    ),
    [historyBookings.length, searchQuery],
  );

  useSetPageHeader(
    "Activity Logs",
    "Service History",
    "A record of all your past vehicle maintenance and detailing.",
    undefined,
    toolbar,
  );

  if (loading) return <PageLoader message="Loading history..." />;

  const columns = [
    {
      key: "bookingid",
      label: "ID",
      render: (row) => (
        <div className="flex items-center gap-1.5 opacity-60">
          <Hash size={12} />
          <span className="font-mono text-xs font-bold">
            {String(row.bookingid).padStart(4, "0")}
          </span>
        </div>
      ),
    },
    {
      key: "vehicle",
      label: "Vehicle Details",
      render: (row) => {
        const vehicleName = row.vehbrand
          ? `${row.vehbrand} ${row.vehmodel}`
          : `Vehicle ID: ${row.vehid}`;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">
              {vehicleName}
            </span>
            <span className="text-[10px] font-mono text-gray-500 italic">
              {row.vehplate || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      key: "date_services",
      label: "Date & Services",
      render: (row) => {
        const services = Array.isArray(row.services) ? row.services : [];
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Calendar size={12} className="text-red-600" />
              {formatDateShortSL(row.bookingdate)}
            </div>
            <div className="flex flex-wrap gap-1">
              {services.length > 0 ? (
                services.map((s, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-600 border border-gray-200 uppercase"
                  >
                    {s.serviceName || s.servicename}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-gray-400 italic">—</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "employee",
      label: "Team Member",
      render: (row) => {
        const employee = row.assigned_employee || "Service Team";
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-[10px] font-black text-red-600 border border-red-100 uppercase">
              {employee.charAt(0)}
            </div>
            <span className="text-xs font-bold text-gray-700">{employee}</span>
          </div>
        );
      },
    },
    {
      key: "bookingstatus",
      label: "Status",
      render: (row) => <StatusBadge status={row.bookingstatus} />,
    },
    {
      key: "totalprice",
      label: "Amount",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <span className="text-sm font-black text-gray-900">
          Rs. {Number(row.totalprice || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: () => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-[11px] font-black uppercase text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 gap-1"
        >
          Receipt
          <ChevronRight size={14} />
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <DataTable
        columns={columns}
        data={filteredBookings}
        keyField="bookingid"
        emptyIcon={History}
        emptyTitle="No past services"
        emptySubtitle="Once you complete a service with us, it will appear here for your records."
        emptyAction={
          <Link to="/dashboard/book">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8 rounded-lg">
              Book Your First Service
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default ServiceHistoryPage;
