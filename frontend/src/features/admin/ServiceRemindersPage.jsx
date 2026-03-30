import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Bell,
  Search,
  Calendar,
  Car,
  ChevronRight,
  AlertTriangle,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/LoadingStates";
import PageToolbar from "@/components/common/PageToolbar";
import DataTable from "@/components/common/DataTable";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import * as vehicleService from "@/services/vehicle.service";
import * as settingsService from "@/services/settings.service";

const ServiceRemindersPage = () => {
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [settings, setSettings] = useState({ service_reminder_prior_days: 7 });
  const [sendingId, setSendingId] = useState(null);

  const toolbar = React.useMemo(
    () => (
      <PageToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search plate or customer..."
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filters={[
          { id: "all", label: "All Vehicles" },
          { id: "overdue", label: "Overdue" },
          { id: "due_soon", label: "Due Soon" },
          { id: "upcoming", label: "Upcoming" },
        ]}
        stats={[
          {
            label: "Total Due",
            value: reminders.length,
            icon: Car,
            iconClassName: "text-red-500",
          },
        ]}
      />
    ),
    [searchTerm, statusFilter, reminders.length]
  );

  useSetPageHeader(
    "Management",
    "Service Reminders",
    "Monitor upcoming vehicle maintenance and dispatch reminder emails manually.",
    null,
    toolbar
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remindersData, settingsData] = await Promise.all([
        vehicleService.getServiceReminders(),
        settingsService.getReminderSettings().catch(() => ({ service_reminder_prior_days: 7 }))
      ]);
      setReminders(remindersData.reminders || []);
      setSettings(settingsData);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
      toast.error("Failed to load service reminders.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (vehicleId) => {
    try {
      setSendingId(vehicleId);
      await vehicleService.sendServiceReminder(vehicleId);
      toast.success("Reminder email dispatched successfully!");
    } catch (error) {
      console.error("Failed to send reminder:", error);
      toast.error("Failed to dispatch the reminder.");
    } finally {
      setSendingId(null);
    }
  };

  const getDiffDays = (dateStr) => {
    const dueDate = new Date(dateStr);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusInfo = (dateStr) => {
    const diffDays = getDiffDays(dateStr);
    
    if (diffDays < 0) {
      return { id: "overdue", label: `Overdue by ${Math.abs(diffDays)} days`, color: "bg-red-100 text-red-800 border-red-200" };
    } else if (diffDays <= settings.service_reminder_prior_days) {
      return { id: "due_soon", label: `Due in ${diffDays} days`, color: "bg-amber-100 text-amber-800 border-amber-200" };
    } else {
      return { id: "upcoming", label: `Upcoming (${diffDays} days left)`, color: "bg-green-100 text-green-800 border-green-200" };
    }
  };

  const filteredReminders = reminders.filter((r) => {
    const searchMatch = (
      r.vehplate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehbrand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cusname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cusemail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!searchMatch) return false;

    if (statusFilter !== "all") {
      const statusId = getStatusInfo(r.next_service_date).id;
      return statusId === statusFilter;
    }

    return true;
  });

  const columns = [
    {
      key: "customer",
      label: "Customer Info",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
            {row.cusname?.charAt(0) || "C"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.cusname}</p>
            <p className="text-xs text-gray-500">{row.cusemail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "vehicle",
      label: "Vehicle Details",
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900 flex items-center gap-1.5">
            {row.vehplate}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {row.vehbrand} {row.vehmodel}
          </p>
        </div>
      ),
    },
    {
      key: "mileage",
      label: "Mileage Status",
      render: (row) => (
        <div className="space-y-1 w-40">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Current:</span>
            <span className="font-semibold">{row.vehmileage?.toLocaleString()} km</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Target:</span>
            <span className="font-semibold text-red-600">{row.next_service_mileage?.toLocaleString()} km</span>
          </div>
        </div>
      ),
    },
    {
      key: "due",
      label: "Due Date",
      render: (row) => {
        const status = getStatusInfo(row.next_service_date);
        return (
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5 font-medium text-gray-900 group-hover:text-red-700 transition-colors">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {new Date(row.next_service_date).toLocaleDateString()}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${status.color}`}>
              {status.label}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <Button
          onClick={() => handleSendReminder(row.vehicle_id)}
          disabled={sendingId === row.vehicle_id}
          variant="outline"
          size="sm"
          className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 shadow-sm"
        >
          {sendingId === row.vehicle_id ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 block rounded-full border-2 border-t-red-600 border-r-transparent border-b-red-600 border-l-transparent animate-spin"/>
              Sending...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              Notify
            </span>
          )}
        </Button>
      ),
    },
  ];

  if (loading) return <PageLoader message="Loading service queue..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={filteredReminders}
          keyField="vehicle_id"
          emptyIcon={Car}
          emptyTitle="No vehicles found"
          emptySubtitle="Try adjusting your search or filters. Or your service reminder queue is clean."
        />
      </div>
    </div>
  );
};

export default ServiceRemindersPage;
