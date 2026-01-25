import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Tag,
  Box,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import * as serviceService from "@/services/service.service";
import * as vehicleService from "@/services/vehicle.service";
import { COLORS } from "@/lib/colors"; // Keep for consistency if used elsewhere

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

  const packages = services.filter(
    (s) => !s.servicetype || s.servicetype === "package",
  );
  const addons = services.filter((s) => s.servicetype === "addon");

  const handleSelectPackage = (serviceId) => {
    // Radio logic: Only one package allowed. Deselect if already selected?
    // Usually radio enforces one. Let's allowing switching.
    // Filter out ANY current package, add new one.
    const currentAddons = selectedServiceIds.filter((id) => {
      const s = services.find((srv) => srv.serviceid === id);
      return s && s.servicetype === "addon";
    });

    // If clicking the ALREADY selected package, toggle off?
    // Or just stay selected. Let's allow toggle off for flexibility.
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(currentAddons);
    } else {
      setSelectedServiceIds([...currentAddons, serviceId]);
    }
  };

  const handleSelectAddon = (serviceId) => {
    // Checkbox logic
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

  const ServiceCard = ({ service, isSelected, onSelect, type }) => (
    <button
      type="button"
      onClick={() => onSelect(service.serviceid)}
      className="w-full text-left transition-all duration-300 transform hover:-translate-y-1 focus:outline-none"
    >
      <Card
        className={cn(
          "h-full border-2 transition-all duration-300 relative overflow-hidden",
          isSelected
            ? "border-red-600 shadow-lg shadow-red-200 bg-red-50/10"
            : "border-transparent hover:border-red-200 shadow-sm",
        )}
      >
        {isSelected && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-600 transform rotate-45 translate-x-8 -translate-y-8 flex items-end justify-center pb-1">
            <Check size={16} className="text-white transform -rotate-45" />
          </div>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-start justify-between gap-2">
            <span
              className={cn(
                "transition-colors",
                isSelected ? "text-red-900" : "text-gray-900",
              )}
            >
              {service.servicename}
            </span>
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-1">
            {service.has_offer && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                OFFER
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <Clock size={10} /> {service.servicetime}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed h-10">
            {service.servicedetails}
          </p>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="text-red-600 font-bold flex items-center">
              {service.has_offer ? (
                <div className="flex items-center gap-2">
                  <span className="line-through text-gray-400 text-xs">
                    Rs. {parseFloat(service.serviceprice).toLocaleString()}
                  </span>
                  <span className="text-lg">
                    Rs. {parseFloat(service.offer_price).toLocaleString()}
                  </span>
                </div>
              ) : (
                <span>
                  Rs. {parseFloat(service.serviceprice).toLocaleString()}
                </span>
              )}
            </div>
            {type === "package" ? (
              <Box size={16} className="text-gray-300" />
            ) : (
              <Layers size={16} className="text-gray-300" />
            )}
          </div>
        </CardContent>
      </Card>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Step 2 of 4
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Select Services
          </h1>
          <p className="text-gray-600">
            Choose a main package and any optional add-ons.
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
          </div>
        )}

        {/* Selected Vehicle Summary */}
        {selectedVehicle && (
          <div className="bg-white border-l-4 border-red-600 rounded-lg p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">
                For Vehicle
              </p>
              <p className="text-xl font-bold text-gray-900">
                {selectedVehicle.vehbrand} {selectedVehicle.vehmodel}
              </p>
              <p className="text-sm text-gray-600 font-medium font-mono">
                {selectedVehicle.vehplate}
              </p>
            </div>
          </div>
        )}

        {/* Packages Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Box className="text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Service Packages
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.length > 0 ? (
              packages.map((service) => (
                <ServiceCard
                  key={service.serviceid}
                  service={service}
                  type="package"
                  isSelected={selectedServiceIds.includes(service.serviceid)}
                  onSelect={handleSelectPackage}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic col-span-3">
                No packages available.
              </p>
            )}
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="space-y-4 pt-8">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Layers className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Optional Add-ons
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {addons.length > 0 ? (
              addons.map((service) => (
                <ServiceCard
                  key={service.serviceid}
                  service={service}
                  type="addon"
                  isSelected={selectedServiceIds.includes(service.serviceid)}
                  onSelect={handleSelectAddon}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic col-span-3">
                No add-ons available.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center pt-8 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10 p-4 -mx-4 md:static md:p-0 md:bg-transparent">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="px-8 h-12 border-2 font-bold uppercase tracking-wide hover:bg-gray-100 flex-1 md:flex-none"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedServiceIds.length === 0}
            className="px-10 h-12 bg-red-600 hover:bg-black text-white font-bold tracking-widest shadow-xl shadow-red-200 disabled:opacity-50 transition-all duration-300 flex-1 md:flex-none"
          >
            Continue ({selectedServiceIds.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;
