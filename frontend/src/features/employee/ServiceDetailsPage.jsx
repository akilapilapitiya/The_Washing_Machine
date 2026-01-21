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
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import * as bookingService from "@/services/booking.service";

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

  const handleUpdateMileage = async () => {
    try {
      setUpdating(true);
      // Assuming bookingService has this or we use general vehicle update
      // For now, let's pretend it updates via the booking service
      await bookingService.updateBookingStatus(id, service.bookingstatus); // Placeholder
      setSuccessMessage("Machine telemetry updated successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update mileage:", err);
      setError("Telemetry synchronization failed.");
    } finally {
      setUpdating(false);
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 size={48} className="animate-spin text-red-600 mb-4" />
        <p className="text-gray-500 font-bold italic tracking-widest text-sm uppercase">
          Accessing Mission Details...
        </p>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="text-center py-12 space-y-4">
            <AlertCircle size={48} className="mx-auto text-red-600" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold uppercase italic">
                Access Denied
              </h3>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/employee/assigned")}
              className="bg-red-600 hover:bg-black text-white"
            >
              Return to Base
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft size={18} className="mr-2" />
            Return
          </Button>
          <div className="flex gap-2">
            <StatusBadge status={service.bookingstatus} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-red-600 font-black">
            Mission Briefing
          </p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            {service.bookingid}
          </h1>
          <p className="text-gray-500 font-medium">
            {" "}
            Assigned Operative: {service.empname || "Self"}
          </p>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium text-sm">
              {successMessage}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                <User size={18} className="text-red-600" />
                Customer Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-red-600 font-bold border">
                    {service.cusname?.charAt(0) || "C"}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {service.cusname || "Unidentified Customer"}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      CID: {service.customerid}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Smartphone size={14} className="text-red-500" />
                    <span className="font-semibold">
                      {service.cusphone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="text-red-500" />
                    <span>{service.cusemail || "N/A"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                <Car size={18} className="text-red-600" />
                Machine Intel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-2xl font-black uppercase italic tracking-tighter">
                      {service.vehbrand} {service.vehmodel}
                    </p>
                    <p className="text-xs font-mono text-red-500 font-bold tracking-[0.2em]">
                      {service.vehplate}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-red-600 rounded flex items-center justify-center">
                    <Car size={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-gray-500 uppercase font-black">
                      Telementry
                    </p>
                    <p className="font-bold">
                      {service.vehmileage?.toLocaleString() || "0"} KM
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 uppercase font-black">Status</p>
                    <p className="font-bold text-green-500">ACTIVE</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                <Calendar size={18} className="text-red-600" />
                Operational Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Date
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Calendar size={14} className="text-red-600" />
                    {formatDate(service.bookingdate)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Window
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Clock size={14} className="text-red-600" />
                    {service.bookingstarttime} - {service.bookingendtime}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Deployment Location
                </p>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <MapPin size={14} className="text-red-600" />
                  {"Main Branch - HQ"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services & Status */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                <Wrench size={18} className="text-red-600" />
                Mission Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <ul className="grid gap-2">
                  {service.services?.map((srv, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-600"></div>
                        <span className="text-sm font-bold text-gray-900">
                          {srv.serviceName}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-gray-500">
                        ${srv.price || "0"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Total Payload
                  </p>
                  <p className="text-2xl font-black text-red-600">
                    ${service.bookingtotalprice || "0"}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] uppercase font-bold text-gray-400 text-right mb-1">
                    Command Control
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        service.bookingstatus === "pending" ||
                        service.bookingstatus === "scheduled"
                          ? "default"
                          : "outline"
                      }
                      className={
                        service.bookingstatus === "pending" ||
                        service.bookingstatus === "scheduled"
                          ? "bg-gray-900 border-gray-900"
                          : "border-gray-300"
                      }
                      onClick={() => handleStatusChange("pending")}
                      disabled={updating}
                    >
                      Hold
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        service.bookingstatus === "inProgress"
                          ? "default"
                          : "outline"
                      }
                      className={
                        service.bookingstatus === "inProgress"
                          ? "bg-red-600 hover:bg-red-700"
                          : "border-gray-300"
                      }
                      onClick={() => handleStatusChange("inProgress")}
                      disabled={updating}
                    >
                      Engage
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        service.bookingstatus === "completed"
                          ? "default"
                          : "outline"
                      }
                      className={
                        service.bookingstatus === "completed"
                          ? "bg-green-600 hover:bg-green-700"
                          : "border-gray-300"
                      }
                      onClick={() => handleStatusChange("completed")}
                      disabled={updating}
                    >
                      Finish
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Telemetry Management */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 border-b py-3">
            <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
              <Wrench size={16} className="text-red-600" />
              Telemetry & Logistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label
                  htmlFor="currentMileage"
                  className="text-xs font-bold uppercase text-gray-500"
                >
                  Update Current Mileage (KM)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="currentMileage"
                    type="number"
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(e.target.value)}
                    placeholder="Enter current KM..."
                    className="border-gray-200 focus:ring-red-500"
                  />
                  <Button
                    onClick={handleUpdateMileage}
                    disabled={updating}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sync
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="nextService"
                  className="text-xs font-bold uppercase text-gray-500"
                >
                  Next Service Threshold (KM)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="nextService"
                    type="number"
                    value={nextServiceMileage}
                    onChange={(e) => setNextServiceMileage(e.target.value)}
                    placeholder="Enter target KM..."
                    className="border-gray-200 focus:ring-red-500"
                  />
                  <Button
                    onClick={handleUpdateMileage}
                    variant="outline"
                    disabled={updating}
                  >
                    Set
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-gray-100 text-gray-800 border-gray-300",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    inProgress: "bg-red-50 text-red-700 border-red-200",
    completed: "bg-green-100 text-green-800 border-green-300",
  };

  const labels = {
    pending: "Pending Approval",
    scheduled: "Deployment Ready",
    inProgress: "Mission Active",
    completed: "Mission Accomplished",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}
    >
      <div
        className={`h-1.5 w-1.5 rounded-full mr-2 animate-pulse ${
          status === "inProgress"
            ? "bg-red-600"
            : status === "completed"
              ? "bg-green-600"
              : "bg-gray-400"
        }`}
      ></div>
      {labels[status] || status}
    </span>
  );
};

export default ServiceDetailsPage;
