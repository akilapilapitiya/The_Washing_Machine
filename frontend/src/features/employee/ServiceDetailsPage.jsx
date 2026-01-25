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
  ArrowLeft,
  AlertCircle,
  Loader2,
  Mail,
  Smartphone,
  ShieldAlert,
  X,
  Send,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import * as bookingService from "@/services/booking.service";
import * as incidentService from "@/services/incident.service";

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [currentMileage, setCurrentMileage] = useState("");
  const [nextServiceMileage, setNextServiceMileage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
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
      setError(null);
      const data = await bookingService.getBookingById(id);
      if (data) {
        setService(data);
        setCurrentMileage(data.vehmileage || "");
      }
    } catch (err) {
      console.error("Failed to fetch service details:", err);
      setError("Operation failed. Could not retrieve mission parameters.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await bookingService.updateBookingStatus(id, newStatus);
      setService((prev) => ({ ...prev, bookingstatus: newStatus }));
      setSuccessMessage(`Mission status updated to ${newStatus}`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Strategic update failed. Signal interrupted.");
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
      setSuccessMessage("Incident reported to management.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to report incident:", err);
      // Don't show global error, maybe alert?
      alert("Failed to create report. Please try again.");
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
        <AlertCircle className="h-12 w-12 text-red-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Mission Data Unavailable
        </h2>
        <p className="text-gray-500">{error || "Service record not found."}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Return to Base
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
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
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    service.bookingstatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : service.bookingstatus === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : service.bookingstatus === "inProgress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {service.bookingstatus}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(service.bookingdate)}
                <span className="mx-1">•</span>
                <Clock size={12} />
                {service.bookingstarttime} - {service.bookingendtime}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle size={18} />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Vehicle Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car size={18} className="text-red-600" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                      Vehicle
                    </p>
                    <p className="font-bold text-lg text-gray-900 mt-1">
                      {service.vehbrand} {service.vehmodel}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                      Plate Number
                    </p>
                    <p className="font-mono font-bold text-lg text-gray-900 mt-1">
                      {service.vehplate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench size={18} className="text-red-600" />
                  Service Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleStatusChange("inProgress")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={
                      service.bookingstatus === "inProgress" ||
                      service.bookingstatus === "completed" ||
                      updating
                    }
                  >
                    Start Job
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("completed")}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={service.bookingstatus === "completed" || updating}
                  >
                    Mark Complete
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusChange("cancelled")}
                    className="w-full"
                    disabled={
                      service.bookingstatus === "completed" ||
                      service.bookingstatus === "cancelled" ||
                      updating
                    }
                  >
                    Cancel Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Customer Card with Report Button */}
            <Card className="border-l-4 border-l-red-600">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User size={18} className="text-red-600" />
                  Customer
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                  title="Report Issue/Harassment"
                  onClick={() => setShowReportModal(true)}
                >
                  <ShieldAlert size={16} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-bold text-gray-900">{service.cusname}</p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>{service.cusemail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{service.custel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin size={18} className="text-red-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 leading-relaxed">
                  {/* Assuming location is latent or stored differently, using placeholder/fields if available */}
                  Location coordinates provided for mobile unit.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Incident Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl border-red-200 border-2">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-red-800 flex items-center gap-2">
                  <ShieldAlert size={20} />
                  Report Issue
                </CardTitle>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-red-800 hover:bg-red-100 rounded-full p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                Please describe the issue with this customer or service. This
                report will be sent directly to the owner.
              </p>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="severity" className="text-sm font-semibold">
                    Severity Level
                  </Label>
                  <select
                    id="severity"
                    className="w-full h-10 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                  >
                    <option value="low">Low - Minor issue</option>
                    <option value="medium">Medium - Concerning behavior</option>
                    <option value="high">High - Harassment / Aggression</option>
                    <option value="critical">
                      Critical - Immediate Threat
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold"
                  >
                    Incident Description
                  </Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[120px] p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Describe what happened..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={reporting}
                    className="w-full"
                  >
                    {reporting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Submitting Report...
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
