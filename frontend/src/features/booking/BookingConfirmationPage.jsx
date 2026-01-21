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

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    vehicle: null,
    services: [],
  });

  const { vehicleId, serviceIds, locationId, employeeId, date, time } =
    location.state || {};

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
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId, serviceIds, navigate]);

  const totalPrice = data.services.reduce(
    (sum, s) => sum + parseFloat(s.serviceprice),
    0,
  );

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const bookingData = {
        vehicleId: parseInt(vehicleId),
        services: serviceIds,
        date,
        startTime: time,
        locationLatitude: 6.9271, // Default to Colombo for now
        locationLongitude: 79.8612,
        status: "pending",
      };

      await bookingService.createBooking(bookingData);
      navigate("/dashboard/bookings", { state: { success: true } });
    } catch (err) {
      console.error("Failed to create booking:", err);
      setError(err.message || "Failed to confirm booking. Please try again.");
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
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 shadow-inner">
              <CheckCircle size={40} className="text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">
            Review & Confirm
          </h1>
          <p className="text-gray-600 font-medium leading-relaxed">
            Please review your premium service details before we dispatch our
            expert team.
          </p>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto bg-red-50 border-2 border-red-100 rounded-xl p-4 flex items-start gap-4 animate-in fade-in zoom-in duration-300">
            <AlertCircle
              size={24}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-red-800 font-bold uppercase tracking-tight text-sm">
              {error}
            </p>
          </div>
        )}

        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          {/* Left Column: Details */}
          <div className="space-y-6">
            {/* Vehicle Details */}
            <Card className="border-2 border-transparent shadow-sm overflow-hidden group">
              <div className="h-1 bg-red-600" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-sm font-black uppercase italic text-gray-500">
                  <Car size={18} className="text-red-600" />
                  Target Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-black text-2xl text-gray-900 uppercase italic">
                    {data.vehicle?.vehbrand} {data.vehicle?.vehmodel}
                  </p>
                  <p className="text-red-600 font-mono font-bold tracking-widest bg-red-50 inline-block px-3 py-1 rounded">
                    {data.vehicle?.vehplate}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Appointment */}
            <Card className="border-2 border-transparent shadow-sm overflow-hidden">
              <div className="h-1 bg-red-600" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-sm font-black uppercase italic text-gray-500">
                  <Calendar size={18} className="text-red-600" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-400">
                      Date
                    </p>
                    <span className="font-bold text-gray-900">
                      {formatDate(date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-400">
                      Time
                    </p>
                    <span className="font-bold text-gray-900">
                      {formatTime(time)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-2 border-transparent shadow-sm overflow-hidden">
              <div className="h-1 bg-red-600" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-sm font-black uppercase italic text-gray-500">
                  <MapPin size={18} className="text-red-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-gray-900 uppercase mb-1">
                  {locationId === "home-visit"
                    ? "Home/On-Site Visit"
                    : "Main Branch Service Center"}
                </p>
                <p className="text-gray-500 text-sm font-medium">
                  {locationId === "home-visit"
                    ? "Colombo & Suburbs Area"
                    : "Pannipitiya, Colombo"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Services & Summary */}
          <div className="space-y-6">
            <Card className="border-2 border-red-600 shadow-xl overflow-hidden bg-white">
              <div className="bg-gray-900 text-white p-6 pb-4">
                <h3 className="text-xs uppercase font-black tracking-widest text-red-500 mb-1">
                  Order Summary
                </h3>
                <p className="text-2xl font-black uppercase italic tracking-tighter">
                  Premium Car Care
                </p>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  {data.services.map((service) => (
                    <div
                      key={service.serviceid}
                      className="flex justify-between items-start group"
                    >
                      <div className="flex gap-3">
                        <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-red-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 uppercase tracking-tight leading-tight">
                            {service.servicename}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            Professional Detail
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-900 font-black font-mono">
                        Rs. {parseFloat(service.serviceprice).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t-2 border-dashed border-gray-100 space-y-4">
                  <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span className="font-mono">
                      Rs. {totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-wider">
                    <span>Service Fee</span>
                    <span className="font-mono">Included</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
                    <span className="text-xl font-black uppercase italic tracking-tighter text-gray-900">
                      Total Price
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-red-600 font-mono">
                        Rs. {totalPrice.toLocaleString()}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        Pay after service
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest py-8 h-auto shadow-2xl shadow-red-200 transition-all duration-300 group"
                >
                  {submitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Confirm Booking
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                    </>
                  )}
                </Button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full text-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
                >
                  Go Back & Edit
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
