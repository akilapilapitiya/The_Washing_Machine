import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import * as incidentService from "@/services/incident.service";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";

import { toast } from "sonner";
const ManageIncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getIncidents();
      setIncidents(data.data || data || []);
    } catch (err) {
      console.error("Failed to load incidents:", err);
      toast.error("Failed to monitor safety channels.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await incidentService.updateIncidentStatus(id, newStatus);
      fetchIncidents();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle size={16} className="text-green-600" />;
      case "dismissed":
        return <XCircle size={16} className="text-gray-400" />;
      case "open":
        return <ShieldAlert size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };

  useSetPageHeader(
    "Security & Safety",
    "Incident Reports",
    "Review and resolve staff-reported issues regarding customer interactions.",
  );

  if (loading) return <PageLoader message="Loading incidents..." />;

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-mono font-bold text-gray-500 text-sm">#{row.id}</span>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${getSeverityColor(
            row.severity,
          )}`}
        >
          {row.severity}
        </span>
      ),
    },
    {
      key: "reporter",
      label: "Reporter & Date",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-gray-900 font-bold text-sm">{row.employee_name || "Unknown"}</span>
          <span className="text-xs text-gray-400 font-normal">
            {new Date(row.created_at).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <p className="text-sm text-gray-700 font-medium line-clamp-1 max-w-[250px]" title={row.description}>
          {row.description}
        </p>
      ),
    },
    {
      key: "customer",
      label: "Customer / Booking",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{row.customer_name || "N/A"}</span>
          {row.booking_id && (
            <span className="text-xs text-blue-600 font-medium">Booking #{row.booking_id}</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.status)}
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{row.status}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        row.status === "open" ? (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[10px] font-black uppercase border-gray-200"
              onClick={() => handleStatusUpdate(row.id, "dismissed")}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="h-8 text-[10px] font-black uppercase bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleStatusUpdate(row.id, "resolved")}
            >
              Resolve
            </Button>
          </div>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <DataTable
        columns={columns}
        data={incidents}
        keyField="id"
        emptyIcon={CheckCircle}
        emptyTitle="All Quiet"
        emptySubtitle="No active incidents reported. Operations are normal."
      />
    </div>
  );
};

export default ManageIncidentsPage;
