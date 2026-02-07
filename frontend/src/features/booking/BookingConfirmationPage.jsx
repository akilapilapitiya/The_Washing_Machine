import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Car,
  Wrench,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as serviceService from "@/services/service.service";
import * as vehicleService from "@/services/vehicle.service";
import * as bookingService from "@/services/booking.service";
import { COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const serviceTotal = data.services.reduce(
    (sum, s) => sum + parseFloat(s.serviceprice),
    0,
  );

  // We will assume backend calculates travel cost, but for frontend display we might need it.
  // For now, let's keep it simple and just show "Calculated at checkout" or similar if we haven't fetched it.
  // OR, we can implement a quick fetch?
  // Let's stick to the plan: Backend does the heavy lifting. Frontend checks are for radius.
  // We can show "Base Price" and "Travel Fee" separately later.
  const totalPrice = serviceTotal + (locationData?.travelCost || 0);

  const handleConfirm = async () => {
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
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hour] = timeString.split(":");
    const hourNum = parseInt(hour);
    return hourNum < 12
      ? `${hourNum}:00 AM`
      : hourNum === 12
        ? `12:00 PM`
        : `${hourNum - 12}:00 PM`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 shadow-sm">
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Review & Confirm
            </h1>
            <p className="text-gray-600">
              Please review your service details before we dispatch our expert
              team.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          {/* Left Column: Details */}
          <div className="space-y-4">
            {/* Vehicle Details */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="flex items-center gap-3 text-sm font-medium text-gray-500">
                  <Car size={18} className="text-red-600" />
                  Target Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="space-y-1">
                  <p className="font-bold text-lg text-gray-900">
                    {data.vehicle?.vehbrand} {data.vehicle?.vehmodel}
                  </p>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block">
                    {data.vehicle?.vehplate}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Appointment */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="flex items-center gap-3 text-sm font-medium text-gray-500">
                  <Calendar size={18} className="text-red-600" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Date</p>
                    <span className="font-medium text-gray-900 text-sm">
                      {formatDate(date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Time</p>
                    <span className="font-medium text-gray-900 text-sm">
                      {formatTime(time)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="flex items-center gap-3 text-sm font-medium text-gray-500">
                  <MapPin size={18} className="text-red-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <p className="font-bold text-gray-900 text-sm mb-0.5">
                  {locationData?.type === "home"
                    ? "Home/On-Site Visit"
                    : "Main Branch Service Center"}
                </p>
                <div className="text-gray-500 text-sm">
                  {locationData?.type === "home" ? (
                    <div className="flex flex-col gap-1">
                      <span>
                        Coordinates: {locationData.lat?.toFixed(4)},{" "}
                        {locationData.lng?.toFixed(4)}
                      </span>
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full w-fit">
                        ~{locationData.distance?.toFixed(1)} km from HQ
                      </span>
                    </div>
                  ) : (
                    "488, High level Road, Pannipitiya, Colombo, Sri Lanka"
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Services & Summary */}
          <div className="space-y-6">
            <Card className="border border-gray-200 shadow-md bg-white overflow-hidden">
              <div className="bg-gray-50 p-5 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-900">
                  Order Summary
                </h3>
              </div>
              <CardContent className="p-5 space-y-5">
                <div className="space-y-3">
                  {data.services.map((service) => (
                    <div
                      key={service.serviceid}
                      className="flex justify-between items-start"
                    >
                      <div className="flex gap-3">
                        <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 leading-tight">
                            {service.servicename}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Professional Detail
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-700 font-medium text-sm">
                        Rs. {parseFloat(service.serviceprice).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-dashed border-gray-200 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      Rs. {serviceTotal.toLocaleString()}
                    </span>
                  </div>

                  {locationData?.travelCost > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Travel Fee</span>
                      <span className="font-medium text-gray-900">
                        Rs. {locationData.travelCost.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Service Fee</span>
                    <span className="font-medium text-green-600">Included</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
                    <span className="text-base font-bold text-gray-900">
                      Total Price
                    </span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        Rs. {totalPrice.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Pay after service
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <Button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all duration-200 group disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Confirm Booking
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="w-full h-11 text-gray-500 hover:text-gray-900"
                  >
                    Go Back & Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
