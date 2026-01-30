import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Clock, Tag, Box, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import * as serviceService from "@/services/service.service";
import * as vehicleService from "@/services/vehicle.service";
import { toast } from "sonner";
import { COLORS } from "@/lib/colors"; // Keep for consistency if used elsewhere

const ServiceSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const vehicleId = location.state?.vehicleId;

  useEffect(() => {
    if (!vehicleId) {
      navigate("/dashboard/book");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        toast.dismiss();

        const [servicesData, vehicleData] = await Promise.all([
          serviceService.getServices(),
          vehicleService.getVehicle(vehicleId),
        ]);

        setServices(servicesData);
        setSelectedVehicle(vehicleData);
      } catch (err) {
        console.error("Failed to fetch booking data:", err);
        toast.error("Failed to load services. Please try again.");
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
      className="w-full text-left transition-all duration-200 focus:outline-none"
    >
      <Card
        className={cn(
          "h-full border transition-all duration-200 relative overflow-hidden active:scale-[0.98]",
          isSelected
            ? "border-red-600 shadow-md bg-red-50/10 ring-1 ring-red-600"
            : "border-gray-200 hover:border-red-300 hover:shadow-md",
        )}
      >
        {isSelected && (
          <div className="absolute top-0 right-0 p-2">
            <div className="bg-red-600 rounded-full p-1 shadow-sm">
              <Check size={12} className="text-white" />
            </div>
          </div>
        )}

        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-base font-bold flex flex-col gap-1.5">
            <span
              className={cn(
                "transition-colors pr-6",
                isSelected ? "text-red-700" : "text-gray-900",
              )}
            >
              {service.servicename}
            </span>
            <div className="flex flex-wrap gap-2">
              {service.has_offer && (
                <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  OFFER
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                <Clock size={10} /> {service.servicetime} mins
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed h-10">
            {service.servicedetails}
          </p>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-red-600 font-bold flex items-center">
              {service.has_offer ? (
                <div className="flex items-center gap-2">
                  <span className="line-through text-gray-400 text-xs font-medium">
                    Rs. {parseFloat(service.serviceprice).toLocaleString()}
                  </span>
                  <span className="text-base">
                    Rs. {parseFloat(service.offer_price).toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-base">
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
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-600">Step 2 of 4</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Select Services
          </h1>
          <p className="text-gray-600">
            Choose a main package and any optional add-ons.
          </p>
        </div>

        {/* Selected Vehicle Summary */}
        {selectedVehicle && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Vehicle:
              </span>
              <div className="flex items-center gap-3">
                <p className="text-base font-bold text-gray-900">
                  {selectedVehicle.vehbrand} {selectedVehicle.vehmodel}
                </p>
                <span className="text-xs font-mono font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {selectedVehicle.vehplate}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
              onClick={() => navigate("/dashboard/book")}
            >
              Change
            </Button>
          </div>
        )}

        {/* Packages Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Box size={20} className="text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Service Packages
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <p className="text-gray-500 text-sm italic col-span-3 py-4">
                No packages available.
              </p>
            )}
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Layers size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Optional Add-ons
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <p className="text-gray-500 text-sm italic col-span-3 py-4">
                No add-ons available.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-end pt-6 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-10 p-4 -mx-4 md:static md:p-0 md:bg-transparent md:border-t-0">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="px-6 h-11 border-gray-300 font-medium hover:bg-white hover:text-red-600 flex-1 md:flex-none"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedServiceIds.length === 0}
            className="px-8 h-11 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all duration-200 disabled:opacity-50 flex-1 md:flex-none"
          >
            Continue ({selectedServiceIds.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;
