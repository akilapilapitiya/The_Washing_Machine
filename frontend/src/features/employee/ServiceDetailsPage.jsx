import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Wrench,
  User,
  Phone,
  CheckCircle,
  ArrowLeft
  Loader2,
  Mail,
  Smartphone,
  ShieldAlert,
  X,
  Send,
  Play,
  CheckSquare,
  Ban,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import * as bookingService from "@/services/booking.service";
import * as incidentService from "@/services/incident.service";
import { toast } from "sonner";

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [currentMileage, setCurrentMileage] = useState("");
  const [nextServiceMileage, setNextServiceMileage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Incident Reporting State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDesc, setReportDesc] = useState("");
  const [reportSeverity, setReportSeverity] = useState("medium");
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      toast.error(null);
      const data = await bookingService.getBookingById(id);
      if (data) {
        setService(data);
        setCurrentMileage(data.vehmileage || "");
      }
    } catch (err) {
      console.error("Failed to fetch service details:", err);
      toast.error("Operation failed. Could not retrieve service details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await bookingService.updateBookingStatus(id, newStatus);
      setService((prev) => ({ ...prev, bookingstatus: newStatus }));
      setSuccessMessage(`Service status updated to ${newStatus}`);
      toast.success("Operation completed successfully");    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;

    try {
      setReporting(true);
      await incidentService.createIncident({
        customerId: service.cusid,
        bookingId: parseInt(id),
        description: reportDesc,
        severity: reportSeverity,
      });
      setShowReportModal(false);
      setReportDesc("");
      setReportSeverity("medium");
      setSuccessMessage("Incident reported successfully.");
      toast.success("Operation completed successfully");    } catch (err) {
      console.error("Failed to report incident:", err);
      toast.error("Failed to create report", {
        description: "Please try again later",
      });
    } finally {
      setReporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-gray-50">
        < className="h-12 w-12 text-red-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Service Data Unavailable
        </h2>
        <p className="text-gray-500">{error || "Service record not found."}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  Service #{id}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    service.bookingstatus === "completed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : service.bookingstatus === "confirmed"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : service.bookingstatus === "inProgress"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {service.bookingstatus}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                <Calendar size={12} />
                {formatDate(service.bookingdate)}
                <span className="mx-1 text-gray-300">|</span>
                <Clock size={12} />
                {service.bookingstarttime} - {service.bookingendtime}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 shadow-sm">
            <CheckCircle size={18} />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Vehicle Details */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <Car size={18} />
                  </div>
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Vehicle Model
                    </p>
                    <p className="font-bold text-lg text-gray-900">
                      {service.vehbrand} {service.vehmodel}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Plate Number
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-yellow-400 text-black font-bold rounded text-xs border border-yellow-500 shadow-sm">
                        WP
                      </div>
                      <p className="font-mono font-bold text-lg text-gray-900">
                        {service.vehplate}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Actions */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Wrench size={18} />
                  </div>
                  Service Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    onClick={() => handleStatusChange("inProgress")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 shadow-sm"
                    disabled={
                      service.bookingstatus === "inProgress" ||
                      service.bookingstatus === "completed" ||
                      updating
                    }
                  >
                    <Play size={18} className="mr-2" />
                    Start Job
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("completed")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 shadow-sm"
                    disabled={service.bookingstatus === "completed" || updating}
                  >
                    <CheckSquare size={18} className="mr-2" />
                    Mark Complete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("cancelled")}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12"
                    disabled={
                      service.bookingstatus === "completed" ||
                      service.bookingstatus === "cancelled" ||
                      updating
                    }
                  >
                    <Ban size={18} className="mr-2" />
                    Cancel Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Customer Card with Report Button */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 border-b border-gray-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <User size={18} />
                  </div>
                  Customer
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2 transition-colors"
                  title="Report Issue"
                  onClick={() => setShowReportModal(true)}
                >
                  <ShieldAlert size={16} />
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Customer Name
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {service.cusname}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span className="font-medium">{service.cusemail}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span className="font-medium">{service.custel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <MapPin size={18} />
                  </div>
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed border border-gray-100">
                  {/* Assuming location is latent or stored differently, using placeholder/fields if available */}
                  <p className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      className="text-gray-400 shrink-0 mt-0.5"
                    />
                    Location coordinates provided in job manifest. Check mobile
                    unit GPS.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Incident Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <ShieldAlert size={20} />
                  </div>
                  Report Issue
                </CardTitle>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded border border-gray-100">
                Please describe the issue with this customer or service. This
                report will be reviewed by management.
              </p>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="severity"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Severity Level
                  </Label>
                  <div className="relative">
                    <select
                      id="severity"
                      className="w-full h-10 pl-3 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none  bg-white appearance-none transition-shadow"
                      value={reportSeverity}
                      onChange={(e) => setReportSeverity(e.target.value)}
                    >
                      <option value="low">Low - Minor issue</option>
                      <option value="medium">
                        Medium - Concerning behavior
                      </option>
                      <option value="high">
                        High - Harassment / Aggression
                      </option>
                      <option value="critical">
                        Critical - Immediate Threat
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Incident Description
                  </Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-sm placeholder:text-gray-400"
                    placeholder="Describe what happened..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowReportModal(false)}
                    className="mr-2"
                    disabled={reporting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-100"
                    disabled={reporting}
                  >
                    {reporting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailsPage;
