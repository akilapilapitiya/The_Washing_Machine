import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

const locations = [
  {
    id: "main-branch",
    title: "The Washing Machine - Main Branch",
    type: "branch",
    address: "Pannipitiya, Colombo, Sri Lanka",
    icon: MapPin,
    description:
      "Visit our main service center with full facilities and expert staff.",
  },
  {
    id: "home-visit",
    title: "Home Visit",
    type: "home",
    address: "We come to you",
    icon: Home,
    description:
      "Our team will visit your location for convenient on-site service.",
  },
];

const LocationSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  const { vehicleId, serviceIds } = location.state || {};

  const handleContinue = () => {
    // Navigate to employee selection with all booking data
    navigate("/dashboard/booking/employee", {
      state: { vehicleId, serviceIds, locationId: selectedLocationId },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-600">Step 3 of 4</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Select Location
          </h1>
          <p className="text-gray-600">
            Choose where you'd like to receive your service.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
          {locations.map((loc) => {
            const Icon = loc.icon;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocationId(loc.id)}
                className="w-full text-left transition-all duration-200 focus:outline-none"
                aria-pressed={selectedLocationId === loc.id}
              >
                <Card
                  className={cn(
                    "h-full border transition-all duration-200 relative overflow-hidden active:scale-[0.98]",
                    selectedLocationId === loc.id
                      ? "border-red-600 shadow-md bg-red-50/10 ring-1 ring-red-600"
                      : "border-gray-200 hover:border-red-300 hover:shadow-md bg-white shadow-sm",
                  )}
                >
                  <CardHeader className="pb-3 pt-6 px-6">
                    <CardTitle className="flex items-start gap-4">
                      <span
                        className={cn(
                          "flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                          selectedLocationId === loc.id
                            ? "bg-red-600 text-white"
                            : "bg-red-50 text-red-600",
                        )}
                      >
                        <Icon size={20} />
                      </span>
                      <div className="flex-1 space-y-1">
                        <div
                          className={cn(
                            "text-lg font-bold transition-colors",
                            selectedLocationId === loc.id
                              ? "text-red-700"
                              : "text-gray-900",
                          )}
                        >
                          {loc.title}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {loc.address}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 pl-[5.5rem]">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {loc.description}
                    </p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
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
            disabled={!selectedLocationId}
            className="px-8 h-11 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all duration-200 disabled:opacity-50 flex-1 md:flex-none"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectionPage;
