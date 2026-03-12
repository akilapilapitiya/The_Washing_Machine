import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Search, ShieldAlert, FileText, User, Calendar, Loader2, CheckCircle, AlertCircle, ShieldCheck, Clock } from "lucide-react";
import * as bookingService from "@/services/booking.service";
import * as incidentService from "@/services/incident.service";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

const EmployeeIncidentPage = () => {
  const [bookings, setBookings] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  // Reporting State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setTableLoading(true);
      const [bookingsData, incidentsData] = await Promise.all([
        bookingService.getBookings(),
        incidentService.getIncidents(),
      ]);
      setBookings(bookingsData || []);
      // Filter incidents logic if needed, but assuming backend filters for employee role
      setIncidents(incidentsData.data || incidentsData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to synchronize safety channels.");
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.bookingstatus !== "cancelled" &&
      (b.cusname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vehplate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingid.toString().includes(searchQuery)),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !description) return;

    try {
      setSubmitting(true);
      await incidentService.createIncident({
        customerId: selectedBooking.cusid,
        bookingId: selectedBooking.bookingid,
        description: description,
        severity: severity,
      });
      toast.success("Incident report submitted successfully.");
      setShowReportModal(false);
      setSelectedBooking(null);
      setDescription("");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to report incident", {
        description: "Please try again later",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle size={14} className="text-green-600" />;
      case "dismissed":
        return <AlertCircle size={14} className="text-gray-400" />;
      default:
        return <Clock size={14} className="text-blue-500" />;
    }
  };

  useSetPageHeader(
    "Safety & Security",
    "Employee Incident Log",
    "Monitor reported issues and safety concerns regarding customer interactions.",
    <Button
      onClick={() => setShowReportModal(true)}
      className="bg-red-600 hover:bg-red-700 text-white font-semibold"
    >
      <Plus size={16} className="mr-2" />
      Report Incident
    </Button>
  );

  if (loading) return <PageLoader message="Loading safety reports..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
            <CardHeader className="bg-white border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ShieldAlert className="text-red-600" size={20} />
                    Report Incident
                  </CardTitle>
                  <CardDescription>
                    Provide details about the safety issue or customer harassment.
                  </CardDescription>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              <div className="grid lg:grid-cols-2 divide-x">
                {/* Booking Selection */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 1: Select Related Booking</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                      <Input
                        placeholder="Search by name or plate..."
                        className="pl-9 h-11 border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-gray-50/50">
                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y divide-gray-100">
                        {filteredBookings.map((booking) => (
                          <tr 
                            key={booking.bookingid}
                            onClick={() => setSelectedBooking(booking)}
                            className={`cursor-pointer transition-colors ${
                              selectedBooking?.bookingid === booking.bookingid
                                ? "bg-red-50"
                                : "hover:bg-white"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-mono font-bold text-gray-500 text-[10px]">#{booking.bookingid}</span>
                                <span className="font-bold text-gray-900 text-xs">{booking.cusname}</span>
                                <span className="text-[10px] text-gray-400">{booking.vehplate}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {selectedBooking?.bookingid === booking.bookingid && (
                                <CheckCircle className="text-red-600 ml-auto" size={16} />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form Details */}
                <div className="p-6 space-y-6 bg-gray-50/30">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 2: Incident Details</Label>
                    {selectedBooking ? (
                      <div className="bg-white p-3 border rounded-xl shadow-sm text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Customer:</span>
                          <span className="text-gray-900 font-bold">{selectedBooking.cusname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Vehicle:</span>
                          <span className="text-gray-900 font-bold">{selectedBooking.vehplate}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 text-orange-700 p-3 rounded-xl border border-orange-100 text-[10px] font-medium flex items-center gap-2">
                        <AlertCircle size={14} />
                        Please select a booking from the left list.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Severity Level</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        required
                      >
                        <option value="low">Low - Minor Concern</option>
                        <option value="medium">Medium - Harassment/Issue</option>
                        <option value="high">High - Aggressive Behavior</option>
                        <option value="critical">Critical - Emergency</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe exactly what happened..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowReportModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting || !selectedBooking}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          "Submit Report"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Incidents Table */}
      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText size={18} className="text-gray-400" />
            Reported Incident History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tableLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-sm font-medium">Synchronizing safety records...</p>
            </div>
          ) : incidents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Severity</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Date Reported</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Description</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Customer/Booking</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Status</th>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(incident.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-1 max-w-[300px]" title={incident.description}>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-32 text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <ShieldCheck size={40} className="text-green-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xl text-gray-900">Safety Clearance</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  You haven't reported any safety incidents. Your working environment remains secure.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeIncidentPage;
