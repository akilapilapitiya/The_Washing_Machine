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
  User,
  Phone,
  CheckCircle,
  Loader2,
  Mail,
  ShieldAlert,
  X,
  CheckSquare,
  Navigation,
  Share2,
  Plus,
  Trash2,
  Wrench,
  Ban,
  Play,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import * as bookingService from "@/services/booking.service";
import * as incidentService from "@/services/incident.service";
import * as chargesService from "@/services/charges.service";
import * as vehicleService from "@/services/vehicle.service";
import { toast } from "sonner";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { PageLoader } from "@/components/common/LoadingStates";
import StatusBadge from "@/components/common/StatusBadge";
import BookingFlowToolbar, {
  BookingToolbarBackButton,
  BookingToolbarActionButton,
} from "@/components/common/BookingFlowToolbar";
import { useAuth } from "@/contexts/AuthContext";
import RescheduleBookingModal from "./RescheduleBookingModal";

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOwner, isCashier } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [currentMileage, setCurrentMileage] = useState("");
  const [nextServiceMileage, setNextServiceMileage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);

  // Extras State
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [extraName, setExtraName] = useState("");
  const [extraDesc, setExtraDesc] = useState("");
  const [addingExtra, setAddingExtra] = useState(false);

  // Incident Reporting State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDesc, setReportDesc] = useState("");
  const [reportSeverity, setReportSeverity] = useState("medium");
  const [reporting, setReporting] = useState(false);

  // Reschedule State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Mileage Recording State (Service Snapshot)
  const [showMileageModal, setShowMileageModal] = useState(false);
  const [submittingSnapshot, setSubmittingSnapshot] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);

  // Helpers Defined at Top to avoid TDZ
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookingById(id);
      if (data) {
        setService(data);
        setCurrentMileage(data.vehmileage || "");
      }
    } catch (err) {
      console.error("Failed to fetch service details:", err);
      toast.error("Operation failed. Could not retrieve service details.");
      setError("Failed to load service details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await bookingService.updateBookingStatus(id, newStatus);
      setService((prev) => ({ ...prev, bookingstatus: newStatus }));
      toast.success(`Service status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle mileage submission + booking completion
  const handleMileageSubmit = async (e) => {
    e.preventDefault();
    const mileageVal = Number(currentMileage);
    const nextVal = Number(nextServiceMileage);

    if (!mileageVal || mileageVal <= 0) {
      toast.error("Current odometer must be greater than 0");
      return;
    }
    if (!nextVal || nextVal <= mileageVal) {
      toast.error("Next service mileage must be greater than current odometer");
      return;
    }

    try {
      setSubmittingSnapshot(true);

      // Step 1: Record service snapshot
      await vehicleService.recordServiceSnapshot(service.vehid, {
        currentMileage: mileageVal,
        nextServiceMileage: nextVal,
        bookingId: parseInt(id),
        isMaintenance: isMaintenance,
      });

      // Step 2: Transition booking to completed
      await bookingService.updateBookingStatus(id, "completed");

      setService((prev) => ({ ...prev, bookingstatus: "completed" }));
      setShowMileageModal(false);
      toast.success("Service completed and mileage recorded successfully");
    } catch (err) {
      console.error("Failed to complete service:", err);
      toast.error(err?.response?.data?.message || "Failed to complete service");
    } finally {
      setSubmittingSnapshot(false);
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
      toast.success("Incident reported successfully");
    } catch (err) {
      console.error("Failed to report incident:", err);
      toast.error("Failed to create report");
    } finally {
      setReporting(false);
    }
  };

  const handleAddExtra = async (e) => {
    e.preventDefault();
    if (!extraName.trim()) return;

    try {
      setAddingExtra(true);
      const newExtra = await chargesService.addExtraItem(id, {
        item_name: extraName,
        description: extraDesc,
      });

      setService((prev) => ({
        ...prev,
        extras: [...(prev.extras || []), newExtra],
      }));

      setShowExtraModal(false);
      setExtraName("");
      setExtraDesc("");
      toast.success("Item added successfully");
    } catch (err) {
      console.error("Failed to add extra item:", err);
      toast.error("Failed to add item");
    } finally {
      setAddingExtra(false);
    }
  };

  const handleRemoveExtra = async (extraId) => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    try {
      await chargesService.removeExtraItem(extraId);
      setService((prev) => ({
        ...prev,
        extras: prev.extras.filter((item) => item.id !== extraId),
      }));
      toast.success("Item removed");
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error("Failed to remove item");
    }
  };

  // Header Actions (Standardized to Booking Flow Theme)
  const headerToolbar = React.useMemo(() => {
    if (!service) return null;

    // Define upcoming statuses that allow starting a service
    const isUpcoming = ["confirmed", "scheduled", "pending"].includes(
      service.bookingstatus,
    );
    const isInProgress = service.bookingstatus === "inProgress";
    const isCancellable = !["completed", "cancelled"].includes(
      service.bookingstatus,
    );

    return (
      <BookingFlowToolbar
        rightSlot={
          <div className="flex items-center gap-2">
            <BookingToolbarBackButton onClick={() => navigate(-1)} />

            {isUpcoming && (isOwner || isCashier) && (
              <BookingToolbarActionButton
                onClick={() => setShowRescheduleModal(true)}
                disabled={updating}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reschedule
              </BookingToolbarActionButton>
            )}

            {isUpcoming && (
              <BookingToolbarActionButton
                onClick={() => handleStatusChange("inProgress")}
                disabled={updating}
                className="bg-gray-900 hover:bg-black"
              >
                {updating ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2 fill-current" />
                )}
                Start Service
              </BookingToolbarActionButton>
            )}

            {isInProgress && (
              <BookingToolbarActionButton
                onClick={() => setShowMileageModal(true)}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                {updating ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete Job
              </BookingToolbarActionButton>
            )}
          </div>
        }
      />
    );
  }, [service, updating, navigate, isOwner, isCashier]);

  useSetPageHeader(
    "OPERATIONAL MISSION",
    service ? `Service Unit #${id}` : "Initializing Unit...",
    service
      ? `${formatDate(service.bookingdate)} | Deployment ${service.bookingstarttime} - ${service.bookingendtime}`
      : "Retrieving operational payload...",
    null,
    headerToolbar,
  );

  if (loading) return <PageLoader message="Synchronizing mission data..." />;

  if (error || !service) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-600" />
        <h2 className="text-xl font-black text-gray-900">
          Mission Data Offline
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          {error || "The requested service record could not be retrieved."}
        </p>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="rounded-xl px-8 font-bold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen animate-in fade-in duration-500">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 items-start">
          {/* Main Content: Mission Core & Extras */}
          <div className="space-y-6">
            {/* Mission Core Card - Mirroring Booking Confirmation table style */}
            <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Car size={16} className="text-red-600" /> Mission Core
                    Details
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic font-mono">
                    #{String(service.bookingid).padStart(4, "0")}
                  </span>
                  <StatusBadge status={service.bookingstatus} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-5 py-3.5 font-semibold text-gray-600 w-40">
                        Vehicle Model
                      </td>
                      <td className="px-5 py-3.5 text-gray-900">
                        {service.vehbrand} {service.vehmodel}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-5 py-3.5 font-semibold text-gray-600">
                        License Plate
                      </td>
                      <td className="px-5 py-3.5 font-mono text-gray-900 tracking-tight">
                        {service.vehplate}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-5 py-3.5 font-semibold text-gray-600">
                        Service Date
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 flex items-center gap-2">
                        <Calendar size={14} className="text-red-600" />
                        {formatDate(service.bookingdate)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-5 py-3.5 font-semibold text-gray-600">
                        Operational Window
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 flex items-center gap-2">
                        <Clock size={14} className="text-red-600" />
                        {service.bookingstarttime} – {service.bookingendtime}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/30">
                      <td className="px-5 py-3.5 font-semibold text-gray-600">
                        Primary Contact
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 leading-tight">
                        <div className="flex flex-col">
                          <span>{service.cusname}</span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {service.cusemail}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 font-semibold text-gray-600">
                        Contact Line
                      </td>
                      <td className="px-5 py-3.5 text-red-600 flex items-center gap-2">
                        <Phone size={14} />
                        {service.cusphone}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Service Inventory (Extras) - Mirroring Booking Confirmation table style */}
            <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Plus size={16} className="text-red-600" /> Resource &
                  Material Log
                </p>
                <Button
                  onClick={() => setShowExtraModal(true)}
                  disabled={
                    service.bookingstatus === "completed" ||
                    service.bookingstatus === "cancelled"
                  }
                  className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wide rounded-md"
                >
                  <Plus size={14} className="mr-1.5" /> Log Material
                </Button>
              </div>
              <div className="p-0">
                {service.extras && service.extras.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50/70 border-b border-gray-100 font-sans">
                        <tr>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left">
                            Material Logged
                          </th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left">
                            Usage Details
                          </th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                            Utility
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {service.extras.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                <span className="text-gray-900">
                                  {item.item_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs text-gray-500 font-medium">
                                {item.description || "—"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={service.bookingstatus === "completed"}
                                className="h-8 w-8 text-gray-300 hover:text-red-600 transition-colors"
                                onClick={() => handleRemoveExtra(item.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center bg-gray-50/30">
                    <CheckSquare
                      size={24}
                      className="mx-auto mb-3 text-gray-200"
                    />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      No Materials Logged
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Area: Map & Quick Pulse Actions */}
          <div className="space-y-6">
            {/* Map Preview Card - Mirroring LocationSelectionPage style */}
            <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="text-red-600" /> Deployment Area
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] font-black uppercase text-gray-400 hover:text-red-600 hover:bg-red-50 px-2"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${service.bookinglocationlatitude},${service.bookinglocationlongitude}`,
                      "_blank",
                    )
                  }
                >
                  <Navigation size={12} className="mr-1" /> External Link
                </Button>
              </div>
              <CardContent className="p-0">
                <div className="h-[280px] w-full relative">
                  <APIProvider
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                  >
                    <Map
                      defaultCenter={{
                        lat: parseFloat(service.bookinglocationlatitude),
                        lng: parseFloat(service.bookinglocationlongitude),
                      }}
                      defaultZoom={15}
                      mapId="SERVICE_MINI_MAP"
                      disableDefaultUI={true}
                      className="w-full h-full"
                    >
                      <AdvancedMarker
                        position={{
                          lat: parseFloat(service.bookinglocationlatitude),
                          lng: parseFloat(service.bookinglocationlongitude),
                        }}
                      >
                        <div className="bg-red-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
                          <MapPin size={16} fill="currentColor" />
                        </div>
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>
                </div>
                {/* Map Footer Details - Mirroring the table style in LocationSelectionPage */}
                <div className="border-t border-gray-100 bg-gray-50/30">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-gray-100/50">
                        <td className="px-5 py-2.5 font-semibold text-gray-500 w-32">
                          Distance from HQ
                        </td>
                        <td className="px-5 py-2.5 text-gray-900">
                          {parseFloat(service.travel_distance || 0).toFixed(1)}{" "}
                          km
                        </td>
                      </tr>
                      <tr>
                        <td className="px-5 py-2.5 font-semibold text-gray-500">
                          Est. Transit
                        </td>
                        <td className="px-5 py-2.5 text-gray-900">
                          ~{parseFloat(service.travel_duration || 0).toFixed(0)}{" "}
                          min
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Pulse Actions / Safety Guard */}
            <Card className="border-red-100 shadow-sm rounded-xl overflow-hidden bg-red-50/50">
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                    <ShieldAlert size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 tracking-tight">
                      Safety Information
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium leading-none mt-0.5 uppercase tracking-tighter">
                      Operational Protocol
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Report any client harassment or security concerns instantly to
                  the operational command.
                </p>
                <Button
                  onClick={() => setShowReportModal(true)}
                  variant="outline"
                  className="w-full h-10 border-red-200 bg-white hover:bg-red-600 text-red-600 hover:text-white font-bold text-[11px] uppercase tracking-widest rounded-lg transition-all shadow-sm"
                >
                  Report Harassment
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* MODALS - Redesigned to match the clean, sharp style */}
        {showExtraModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Plus size={16} className="text-red-600" /> Log Mission
                  Materials
                </CardTitle>
                <X
                  className="cursor-pointer text-gray-400 hover:text-gray-900 transition-colors"
                  size={18}
                  onClick={() => setShowExtraModal(false)}
                />
              </div>
              <CardContent className="p-6">
                <form onSubmit={handleAddExtra} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Material ID / Name
                    </Label>
                    <Input
                      value={extraName}
                      onChange={(e) => setExtraName(e.target.value)}
                      placeholder="e.g. Premium Clay Bar"
                      required
                      className="h-10 border-gray-200 font-semibold text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Usage Description
                    </Label>
                    <Input
                      value={extraDesc}
                      onChange={(e) => setExtraDesc(e.target.value)}
                      placeholder="Applied to exterior panels"
                      className="h-10 border-gray-200 font-semibold text-sm rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3 pt-4 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 text-xs font-bold uppercase text-gray-500"
                      onClick={() => setShowExtraModal(false)}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      disabled={addingExtra}
                      className="flex-1 bg-gray-900 hover:bg-black text-white font-bold uppercase text-xs tracking-widest rounded-lg shadow-md"
                    >
                      {addingExtra ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        "Record Item"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {showReportModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
                  <ShieldAlert size={18} /> Report Harassment
                </CardTitle>
                <X
                  className="cursor-pointer text-gray-400 hover:text-gray-900 transition-colors"
                  size={18}
                  onClick={() => setShowReportModal(false)}
                />
              </div>
              <CardContent className="p-6">
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Threat Level
                    </Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-red-600"
                      value={reportSeverity}
                      onChange={(e) => setReportSeverity(e.target.value)}
                    >
                      <option value="low">Level 1 - General Concern</option>
                      <option value="medium">Level 2 - Action Required</option>
                      <option value="high">Level 3 - Immediate Threat</option>
                      <option value="critical">
                        Level 4 - Operational Emergency
                      </option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Incident Brief
                    </Label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-red-600 resize-none shadow-inner"
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      required
                      placeholder="Provide concise narrative of the safety concern..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 text-xs font-bold uppercase text-gray-500"
                      onClick={() => setShowReportModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={reporting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-widest rounded-lg shadow-lg"
                    >
                      {reporting ? (
                        <Loader2 className="animate-spin" size={16} />
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

        {showRescheduleModal && (
          <RescheduleBookingModal
            booking={service}
            onClose={() => setShowRescheduleModal(false)}
            onRescheduled={fetchServiceDetails}
          />
        )}

        {/* Mileage Recording Modal — mandatory before completion */}
        {showMileageModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Wrench size={16} className="text-green-600" /> Record Service
                  Mileage
                </CardTitle>
                <X
                  className="cursor-pointer text-gray-400 hover:text-gray-900 transition-colors"
                  size={18}
                  onClick={() => setShowMileageModal(false)}
                />
              </div>
              <CardContent className="p-6">
                <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                    Recording the odometer reading is required before marking
                    this service as complete. This enables automated next-service
                    reminders for the customer.
                  </p>
                </div>
                <form onSubmit={handleMileageSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Current Odometer (km)
                    </Label>
                    <Input
                      type="number"
                      value={currentMileage}
                      onChange={(e) => setCurrentMileage(e.target.value)}
                      placeholder="e.g. 45000"
                      required
                      min="1"
                      className="h-10 border-gray-200 font-semibold text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Next Service Due At (km)
                    </Label>
                    <Input
                      type="number"
                      value={nextServiceMileage}
                      onChange={(e) => setNextServiceMileage(e.target.value)}
                      placeholder="e.g. 50000"
                      required
                      min="1"
                      className="h-10 border-gray-200 font-semibold text-sm rounded-lg"
                    />
                    {currentMileage &&
                      nextServiceMileage &&
                      Number(nextServiceMileage) > Number(currentMileage) && (
                        <p className="text-[10px] text-green-600 font-bold ml-1 mt-1">
                          ≈{" "}
                          {(Number(nextServiceMileage) - Number(currentMileage)).toLocaleString()}{" "}
                          km until next service
                        </p>
                      )}
                    {currentMileage &&
                      nextServiceMileage &&
                      Number(nextServiceMileage) <= Number(currentMileage) && (
                        <p className="text-[10px] text-red-600 font-bold ml-1 mt-1">
                          Must be greater than current odometer
                        </p>
                      )}
                  </div>
                  
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={isMaintenance}
                        onChange={(e) => setIsMaintenance(e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-xs font-semibold text-gray-700">
                        Use this service to calculate Next Service Due Date
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex gap-3 pt-4 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 text-xs font-bold uppercase text-gray-500"
                      onClick={() => setShowMileageModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        submittingSnapshot ||
                        !currentMileage ||
                        !nextServiceMileage ||
                        Number(nextServiceMileage) <= Number(currentMileage)
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs tracking-widest rounded-lg shadow-md disabled:opacity-50"
                    >
                      {submittingSnapshot ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        "Complete Service"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
