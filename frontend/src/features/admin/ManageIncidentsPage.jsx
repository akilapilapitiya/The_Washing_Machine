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
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

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

  return (
          <div className="mx-auto w-full max-w-7xl space-y-8">
        {incidents.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Severity</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Reporter & Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Description</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Customer / Booking</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-500 text-sm">#{incident.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                          incident.severity === 'critical' ? 'bg-red-50 text-red-600 border-red-100' :
                          incident.severity === 'high' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">{incident.employee_name || "Unknown"}</span>
                          <span className="text-xs text-gray-400 font-normal">{new Date(incident.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-medium line-clamp-1 max-w-[250px]" title={incident.description}>
                          {incident.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{incident.customer_name || "N/A"}</span>
                          {incident.booking_id && (
                            <span className="text-xs text-blue-600 font-medium">Booking #{incident.booking_id}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(incident.status)}
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{incident.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {incident.status === "open" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] font-black uppercase border-gray-200"
                                onClick={() => handleStatusUpdate(incident.id, "dismissed")}
                              >
                                Dismiss
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 text-[10px] font-black uppercase bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleStatusUpdate(incident.id, "resolved")}
                              >
                                Resolve
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    
  );
};

export default ManageIncidentsPage;
