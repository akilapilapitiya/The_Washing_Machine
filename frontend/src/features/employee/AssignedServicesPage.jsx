import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Car,
  Wrench,
  ChevronRight,
  Hash,
} from "lucide-react";
import { Link } from "react-router-dom";
import * as bookingService from "@/services/booking.service";
import { formatDateShortSL } from "@/lib/dateFormat";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";

const AssignedServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    const fetchAssignedServices = async () => {
      try {
        const data = await bookingService.getBookings();
        setServices(data || []);
      } catch (err) {
        console.error("Failed to fetch assigned services:", err);
        toast.error("Failed to synchronize task queue. Please re-authenticate.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedServices();
  }, []);

  const pendingServices = services.filter(
    (s) => s.bookingstatus === "pending" || s.bookingstatus === "scheduled",
  );
  const inProgressServices = services.filter(
    (s) => s.bookingstatus === "inProgress",
  );
  const completedServices = services.filter(
    (s) => s.bookingstatus === "completed",
  );

  // Toolbar: tab switcher lives in PageSubHeader's second row
  const toolbar = useMemo(
    () => (
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-0 p-0 gap-1 h-auto">
          <TabsTrigger
            value="upcoming"
            className="px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:bg-gray-100 border-0"
          >
            Upcoming ({pendingServices.length})
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:bg-gray-100 border-0"
          >
            In Progress ({inProgressServices.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:bg-gray-100 border-0"
          >
            History ({completedServices.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>
    ),
    [activeTab, pendingServices.length, inProgressServices.length, completedServices.length],
  );

  useSetPageHeader(
    "Employee Portal",
    "Assigned Services",
    "View and manage your assigned detailing missions.",
    null,
    toolbar,
  );

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
      key: "customer_vehicle",
      label: "Customer & Vehicle",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-gray-900">
            {row.cusname || "Unknown Customer"}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {row.vehbrand} {row.vehmodel}
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            {row.vehplate}
          </span>
        </div>
      ),
    },
    {
      key: "datetime",
      label: "Date & Time",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Calendar size={12} className="text-red-600" />
            {formatDateShortSL(row.bookingdate)}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <Clock size={12} />
            {row.bookingstarttime} – {row.bookingendtime}
          </div>
        </div>
      ),
    },
    {
      key: "services",
      label: "Services",
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {row.services && row.services.length > 0 ? (
            row.services.map((s, idx) => (
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
      ),
    },
    {
      key: "bookingstatus",
      label: "Status",
      render: (row) => <StatusBadge status={row.bookingstatus} />,
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <Link to={`/dashboard/employee/service/${row.bookingid}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[11px] font-black uppercase text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 gap-1"
          >
            Open
            <ChevronRight size={14} />
          </Button>
        </Link>
      ),
    },
  ];

  if (loading) return <PageLoader message="Loading assignment logs..." />;

  const currentData =
    activeTab === "upcoming"
      ? pendingServices
      : activeTab === "in-progress"
        ? inProgressServices
        : completedServices;

  const emptyConfigs = {
    upcoming: {
      icon: Calendar,
      title: "Queue Empty",
      subtitle: "No scheduled missions assigned to you yet.",
    },
    "in-progress": {
      icon: Wrench,
      title: "No Active Jobs",
      subtitle: "Initialize a mission from the upcoming queue.",
    },
    completed: {
      icon: Car,
      title: "No History",
      subtitle: "Completed missions will be archived here.",
    },
  };

  const empty = emptyConfigs[activeTab];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <DataTable
        columns={columns}
        data={currentData}
        keyField="bookingid"
        emptyIcon={empty.icon}
        emptyTitle={empty.title}
        emptySubtitle={empty.subtitle}
      />
    </div>
  );
};

export default AssignedServicesPage;
