import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, AlertCircle, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import * as serviceService from "@/services/service.service";
import * as vehicleService from "@/services/vehicle.service";
import { COLORS } from "@/lib/colors";

const ServiceSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const vehicleId = location.state?.vehicleId;

  useEffect(() => {
    if (!vehicleId) {
      navigate("/dashboard/book");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [servicesData, vehicleData] = await Promise.all([
          serviceService.getServices(),
          vehicleService.getVehicle(vehicleId),
        ]);

        setServices(servicesData);
        setSelectedVehicle(vehicleData);
      } catch (err) {
        console.error("Failed to fetch booking data:", err);
        setError("Failed to load services. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId, navigate]);

  const handleSelectService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleContinue = () => {
    navigate("/dashboard/booking/location", {
      state: { vehicleId, serviceIds: selectedServiceIds },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading available services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Book Service
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Select services
          </h1>
          <p className="text-gray-600">
            Choose one or more services you'd like for your vehicle.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {selectedVehicle && (
          <div className="bg-white border-l-4 border-red-600 rounded-lg p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">
                Target Vehicle
              </p>
              <p className="text-xl font-bold text-gray-900">
                {selectedVehicle.vehbrand} {selectedVehicle.vehmodel}
              </p>
              <p className="text-sm text-gray-600 font-medium font-mono">
                {selectedVehicle.vehplate}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
              <Check className="text-red-600" size={24} />
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <button
              key={service.serviceid}
              type="button"
              onClick={() => handleSelectService(service.serviceid)}
              className="group text-left transition-all duration-300 transform hover:-translate-y-1"
              aria-pressed={selectedServiceIds.includes(service.serviceid)}
            >
              <Card
                className={cn(
                  "h-full border-2 transition-all duration-300 relative overflow-hidden",
                  selectedServiceIds.includes(service.serviceid)
                    ? "border-red-600 shadow-lg shadow-red-200"
                    : "border-transparent hover:border-red-200 shadow-sm",
                )}
              >
                {selectedServiceIds.includes(service.serviceid) && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-600 transform rotate-45 translate-x-8 -translate-y-8 flex items-end justify-center pb-1">
                    <Check
                      size={16}
                      className="text-white transform -rotate-45"
                    />
                  </div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <span
                      className={cn(
                        "transition-colors",
                        selectedServiceIds.includes(service.serviceid)
                          ? "text-red-600"
                          : "text-gray-900 group-hover:text-red-600",
                      )}
                    >
                      {service.servicename}
                    </span>
                    {service.has_offer && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold uppercase text-red-700">
                        OFFER
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                    {service.servicedetails}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center text-red-600 font-bold">
                      <Tag size={14} className="mr-2" />
                      {service.has_offer ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-400 text-xs font-medium">
                            Rs.{" "}
                            {parseFloat(service.serviceprice).toLocaleString()}
                          </span>
                          <span className="text-lg animate-pulse">
                            Rs.{" "}
                            {parseFloat(service.offer_price).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span>
                          Rs.{" "}
                          {parseFloat(service.serviceprice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {service.has_offer && service.offer_description && (
                      <div className="text-xs font-bold text-red-600 bg-red-50 p-1 rounded inline-block">
                        {service.offer_description}
                      </div>
                    )}
                    <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-tight">
                      <Clock size={14} className="mr-2" />
                      <span>Approx. {service.servicetime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-center pt-8 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="px-8 h-14 border-2 font-bold uppercase tracking-wide hover:bg-gray-100"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedServiceIds.length === 0}
            className="px-10 h-14 bg-red-600 hover:bg-black text-white font-bold tracking-widest shadow-xl shadow-red-200 disabled:opacity-50 transition-all duration-300"
          >
            Continue with {selectedServiceIds.length}{" "}
            {selectedServiceIds.length === 1 ? "service" : "services"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;
