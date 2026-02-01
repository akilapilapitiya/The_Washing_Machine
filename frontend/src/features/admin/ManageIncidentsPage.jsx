import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldAlert,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  FileText,
} from "lucide-react";
import * as incidentService from "@/services/incident.service";
import { COLORS } from "@/lib/colors";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Security & Safety
          </p>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-red-600" />
            Incident Reports
          </h1>
          <p className="text-gray-600">
            Review and resolve staff-reported issues regarding customer
            interactions.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-red-600 h-12 w-12" />
          </div>
        ) : incidents.length > 0 ? (
          <div className="grid gap-6">
            {incidents.map((incident) => (
              <Card
                key={incident.id}
                className={`border-l-4 ${incident.status === "open" ? "border-l-red-500" : "border-l-gray-300"}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${getSeverityColor(incident.severity)}`}
                        >
                          {incident.severity}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          ID: #{incident.id}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {new Date(incident.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {incident.description}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span className="font-semibold">
                              Reporter:
                            </span>{" "}
                            {incident.employee_name || "Unknown"}
                          </div>
                          {incident.customer_name && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle
                                size={14}
                                className="text-orange-500"
                              />
                              <span className="font-semibold">Customer:</span>{" "}
                              {incident.customer_name}
                            </div>
                          )}
                          {incident.booking_id && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <FileText size={14} />
                              <span>Booking #{incident.booking_id}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-700 uppercase">
                          Status
                        </span>
                        {getStatusIcon(incident.status)}
                        <span className="text-sm capitalize font-medium">
                          {incident.status}
                        </span>
                      </div>

                      {incident.status !== "resolved" &&
                        incident.status !== "dismissed" && (
                          <div className="flex gap-2 w-full md:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 hover:bg-gray-100 text-gray-600"
                              onClick={() =>
                                handleStatusUpdate(incident.id, "dismissed")
                              }
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() =>
                                handleStatusUpdate(incident.id, "resolved")
                              }
                            >
                              Resolve
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed py-16 bg-transparent">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-full">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">All Quiet</h3>
              <p className="text-gray-500">
                No active incidents reported. Operations are normal.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageIncidentsPage;
