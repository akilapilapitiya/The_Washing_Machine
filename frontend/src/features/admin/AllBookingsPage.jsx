import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { Calendar, Clock, Briefcase, Wrench, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import * as bookingService from "@/services/booking.service";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import PageToolbar from "@/components/common/PageToolbar";
import { toast } from "sonner";

const AllBookingsPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { isOwner, isCashier } = useAuth();

  const fetchServices = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings();
      const searchId = searchParams.get("search");

      if (searchId) {
        const foundBooking = data.find((b) => String(b.bookingid) === searchId);
        if (foundBooking) {
          setServices([foundBooking]); // Show only the targeted booking
          setSearchQuery(searchId); // Pre-fill search query with the ID
        } else {
          setServices([]); // No booking found for the ID
          toast.info(`No booking found with ID: ${searchId}`);
        }
      } else {
        setServices(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      toast.error("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = services.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      (s.cusname?.toLowerCase() || "").includes(query) ||
      (s.assigned_empname?.toLowerCase() || "").includes(query) ||
      (s.vehplate?.toLowerCase() || "").includes(query) ||
      String(s.bookingid).includes(query)
    );
  });

  const pendingServices = filteredServices.filter(
    (s) => s.bookingstatus === "pending" || s.bookingstatus === "scheduled",
  );
  const inProgressServices = filteredServices.filter(
    (s) => s.bookingstatus === "inProgress",
  );
  const completedServices = filteredServices.filter(
    (s) => s.bookingstatus === "completed" || s.bookingstatus === "paid",
  );

  const [activeTab, setActiveTab] = useState("upcoming");

  const toolbar = useMemo(
    () => (
      <PageToolbar
        leftSlot={
          <div className="flex items-center gap-1 bg-gray-100/50 border border-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${
                activeTab === "upcoming"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Upcoming ({pendingServices.length})
            </button>
            <button
              onClick={() => setActiveTab("in-progress")}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${
                activeTab === "in-progress"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Active ({inProgressServices.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${
                activeTab === "completed"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Completed ({completedServices.length})
            </button>
          </div>
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search bookings..."
        searchWidthClass="sm:w-64"
      />
    ),
    [
      activeTab,
      pendingServices.length,
      inProgressServices.length,
      completedServices.length,
      searchQuery,
    ],
  );

  useSetPageHeader(
    isOwner || isCashier ? "Service Operations" : "Employee Portal",
    isOwner || isCashier ? "Service Queue" : "My Assignments",
    isOwner || isCashier
      ? "Manage all bookings, view status, and assign tasks."
      : "View your upcoming and active service tasks.",
    null,
    toolbar,
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-mono font-bold text-gray-500 text-sm">
          #{String(row.bookingid).padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer & Vehicle",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm">
            {row.cusname || "Unregistered"}
          </span>
          <span className="text-xs text-gray-500 font-medium mt-0.5">
            {row.vehbrand} {row.vehmodel} • {row.vehplate}
          </span>
        </div>
      ),
    },
    {
      key: "datetime",
      label: "Date & Time",
      render: (row) => (
        <div className="flex flex-col text-sm font-medium text-gray-600">
          <span>
            {row.bookingdate
              ? format(new Date(row.bookingdate), "MMM d, yyyy")
              : "N/A"}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">
            {row.bookingstarttime} - {row.bookingendtime}
          </span>
        </div>
      ),
    },
    {
      key: "employee",
      label: "Employee",
      render: (row) => (
        <span className="text-sm font-semibold text-gray-700">
          {row.assigned_empname || (
            <span className="text-gray-300 italic font-normal">Unassigned</span>
          )}
        </span>
      ),
    },
    {
      key: "services",
      label: "Services",
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.services && row.services.length > 0 ? (
            row.services.map((svc, idx) => (
              <span
                key={idx}
                className="bg-blue-50 text-blue-600 text-[9px] px-1.5 py-0.5 rounded font-bold border border-blue-100 uppercase whitespace-nowrap"
              >
                {svc.serviceName || svc.servicename}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-gray-400 font-semibold">
              Standard
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.bookingstatus} />,
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => {
        const showActions = isOwner || isCashier;
        return (
          <div className="flex justify-end gap-2">
            {showActions &&
              (row.bookingstatus === "pending" ||
                row.bookingstatus === "scheduled") && (
                <Link to={`/dashboard/admin/bookings?search=${row.bookingid}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-[10px] font-black uppercase text-gray-500 hover:text-gray-900 border-gray-200"
                  >
                    Reassign
                  </Button>
                </Link>
              )}
            {showActions && row.bookingstatus === "completed" && (
              <Link
                to={`/dashboard/employee/payments?bookingId=${row.bookingid}`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-[10px] font-black uppercase border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  Pay
                </Button>
              </Link>
            )}
            <Link to={`/dashboard/employee/service/${row.bookingid}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-[10px] font-black uppercase text-gray-500 hover:text-gray-900 border-gray-200"
              >
                View
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  if (loading) return <PageLoader message="Loading bookings..." />;

  const getActiveData = () => {
    switch (activeTab) {
      case "in-progress":
        return inProgressServices;
      case "completed":
        return completedServices;
      default:
        return pendingServices;
    }
  };

  const getEmptyProps = () => {
    switch (activeTab) {
      case "in-progress":
        return {
          icon: Wrench,
          title: "No active jobs",
          subtitle: "There are no services currently in progress.",
        };
      case "completed":
        return {
          icon: CheckCircle,
          title: "No completed services",
          subtitle: "Completed service records will appear here.",
        };
      default:
        return {
          icon: Calendar,
          title: "No upcoming bookings",
          subtitle: "Check back later for new assignments.",
        };
    }
  };

  const emptyProps = getEmptyProps();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <DataTable
        columns={columns}
        data={getActiveData()}
        keyField="bookingid"
        emptyIcon={emptyProps.icon}
        emptyTitle={emptyProps.title}
        emptySubtitle={
          searchQuery ? "No bookings match your search." : emptyProps.subtitle
        }
      />
    </div>
  );
};

export default AllBookingsPage;
