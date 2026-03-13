import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as serviceService from "@/services/service.service";
import * as vehicleService from "@/services/vehicle.service";
import * as bookingService from "@/services/booking.service";
import { toast } from "sonner";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    vehicle: null,
    services: [],
  });

  const { vehicleId, serviceIds, locationData, employeeId, date, time } =
    location.state || {}; // locationData now holds { id, type, lat, lng, distance }

  useEffect(() => {
    if (!vehicleId || !serviceIds) {
      navigate("/dashboard/book");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehicle, allServices] = await Promise.all([
          vehicleService.getVehicle(vehicleId),
          serviceService.getServices(),
        ]);

        const selectedServices = allServices.filter((s) =>
          serviceIds.includes(s.serviceid),
        );

        setData({
          vehicle,
          services: selectedServices,
        });
      } catch (err) {
        console.error("Failed to fetch confirmation data:", err);
        toast.error("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId, serviceIds, navigate]);

  const serviceTotal = data.services.reduce((sum, service) => {
    const amount = service.has_offer ? service.offer_price : service.serviceprice;
    return sum + parseFloat(amount || 0);
  }, 0);

  // We will assume backend calculates travel cost, but for frontend display we might need it.
  // For now, let's keep it simple and just show "Calculated at checkout" or similar if we haven't fetched it.
  // OR, we can implement a quick fetch?
  // Let's stick to the plan: Backend does the heavy lifting. Frontend checks are for radius.
  // We can show "Base Price" and "Travel Fee" separately later.
  const totalPrice = serviceTotal + (locationData?.travelCost || 0);

  const handleConfirm = useCallback(async () => {
    try {
      setSubmitting(true);

      const bookingData = {
        vehicleId: parseInt(vehicleId),
        services: serviceIds,
        date,
        startTime: time,
        // Pass location data
        locationLatitude: locationData?.lat || 6.9271,
        locationLongitude: locationData?.lng || 79.8612,
        locationType: locationData?.type || "branch",
        travelDistance: locationData?.distance || 0,
        travelDuration: locationData?.duration || 0,

        employeeId: employeeId === "any" ? null : employeeId,
        status: "pending",
      };

      await bookingService.createBooking(bookingData);
      toast.success("Booking confirmed successfully!");
      navigate("/dashboard/bookings", { state: { success: true } });
    } catch (err) {
      console.error("Failed to create booking:", err);
      toast.error(
        err.message || "Failed to confirm booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    setSubmitting,
    vehicleId,
    serviceIds,
    date,
    time,
    locationData,
    employeeId,
    navigate,
  ]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const [hour] = timeString.split(":");
    const hourNum = parseInt(hour, 10);
    return hourNum < 12
      ? `${hourNum}:00 AM`
      : hourNum === 12
        ? "12:00 PM"
        : `${hourNum - 12}:00 PM`;
  };

  const formatEndTime = (timeString) => {
    if (!timeString) return "-";
    const [hour, minute] = timeString.split(":").map(Number);
    const start = new Date(2000, 0, 1, hour, minute || 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const locationSummary =
    locationData?.type === "home"
      ? `Home / On-Site Visit${locationData?.distance ? ` • ~${locationData.distance.toFixed(1)} km from HQ` : ""}`
      : "Main Branch Service Center";

  const employeeSummary =
    employeeId === "any" || employeeId === null || employeeId === undefined
      ? "Any available employee"
      : `Employee #${employeeId}`;

  const vehicleSummary =
    data.vehicle?.vehbrand && data.vehicle?.vehmodel
      ? `${data.vehicle.vehbrand} ${data.vehicle.vehmodel}${
        data.vehicle?.vehplate ? ` • ${data.vehicle.vehplate}` : ""
      }`
      : "Vehicle details unavailable";

  const goToVehicle = useCallback(() => {
    navigate("/dashboard/book");
  }, [navigate]);

  const goToServices = useCallback(() => {
    navigate("/dashboard/booking/services", {
      state: { vehicleId },
    });
  }, [navigate, vehicleId]);

  const goToLocation = useCallback(() => {
    navigate("/dashboard/booking/location", {
      state: { vehicleId, serviceIds },
    });
  }, [navigate, vehicleId, serviceIds]);

  const goToEmployee = useCallback(() => {
    navigate("/dashboard/booking/employee", {
      state: { vehicleId, serviceIds, locationData },
    });
  }, [navigate, vehicleId, serviceIds, locationData]);

  const goToDateTime = useCallback(() => {
    navigate("/dashboard/booking/datetime", {
      state: { vehicleId, serviceIds, locationData, employeeId },
    });
  }, [navigate, vehicleId, serviceIds, locationData, employeeId]);

  const toolbarTabs = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "Services" },
  ];

  const toolbar = useMemo(
    () => (
      <div className="w-full flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {toolbarTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 h-8 rounded-md text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-red-600 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={submitting}
          className="h-9 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all duration-200 group disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Confirm Booking
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    ),
    [activeTab, handleConfirm, submitting],
  );

  useSetPageHeader(
    "BOOK SERVICE",
    "Review & Confirm",
    "Review your booking details and confirm your appointment.",
    null,
    toolbar
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              {activeTab === "overview" && (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 w-52">Field</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Detail</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-600 w-28">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 font-semibold text-gray-600">Vehicle</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{vehicleSummary}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={goToVehicle}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                          >
                            Change
                          </button>
                        </td>
                      </tr>

                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 font-semibold text-gray-600">Date</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{formatDate(date)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={goToDateTime}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                          >
                            Change
                          </button>
                        </td>
                      </tr>

                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 font-semibold text-gray-600">Start Time</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{formatTime(time)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={goToDateTime}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                          >
                            Change
                          </button>
                        </td>
                      </tr>

                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 font-semibold text-gray-600">End Time</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{formatEndTime(time)}</td>
                        <td className="px-4 py-3 text-right text-gray-400">—</td>
                      </tr>

                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 font-semibold text-gray-600">Location</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{locationSummary}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={goToLocation}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                          >
                            Change
                          </button>
                        </td>
                      </tr>

                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 font-semibold text-gray-600">Assigned Employee</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{employeeSummary}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={goToEmployee}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                          >
                            Change
                          </button>
                        </td>
                      </tr>

                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-600">Price Total</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">Rs. {serviceTotal.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-400">—</td>
                      </tr>

                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 font-semibold text-gray-600">Travel Cost</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">
                          Rs. {(locationData?.travelCost || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">—</td>
                      </tr>

                      <tr className="bg-red-50">
                        <td className="px-4 py-3 font-bold text-gray-900">Grand Total</td>
                        <td className="px-4 py-3 font-bold text-red-600 text-base">Rs. {totalPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-400">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "services" && (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600">Service</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <td className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500" colSpan={3}>
                            <div className="flex items-center justify-between gap-2">
                              <span>Selected Services</span>
                              <button
                                type="button"
                                onClick={goToServices}
                                className="text-[11px] font-semibold text-red-600 hover:text-red-700 normal-case tracking-normal"
                              >
                                Change Services
                              </button>
                            </div>
                          </td>
                        </tr>
                        {data.services.map((service) => {
                          const amount = parseFloat(
                            service.has_offer ? service.offer_price : service.serviceprice,
                          );

                          return (
                            <tr key={service.serviceid} className="border-b border-gray-100 last:border-b-0">
                              <td className="px-4 py-3 text-gray-900 font-medium">{service.servicename}</td>
                              <td className="px-4 py-3 text-gray-500 capitalize">{service.servicetype || "package"}</td>
                              <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                                Rs. {amount.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
              )}

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
