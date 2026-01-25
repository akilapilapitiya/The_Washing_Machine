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
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Book Service
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Select location
          </h1>
          <p className="text-gray-600">
            Choose where you'd like to receive your service.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          {locations.map((loc) => {
            const Icon = loc.icon;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocationId(loc.id)}
                className="text-left group transition-all duration-300"
                aria-pressed={selectedLocationId === loc.id}
              >
                <Card
                  className={cn(
                    "h-full border-2 transition-all duration-300",
                    selectedLocationId === loc.id
                      ? "border-red-600 shadow-md ring-1 ring-red-600"
                      : "border-transparent hover:border-red-200 bg-white shadow-sm",
                  )}
                >
                  <CardHeader>
                    <CardTitle className="flex items-start gap-4 text-lg">
                      <span
                        className={cn(
                          "flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                          selectedLocationId === loc.id
                            ? "bg-red-600 text-white"
                            : "bg-red-50 text-red-600",
                        )}
                      >
                        <Icon size={24} />
                      </span>
                      <div className="flex-1">
                        <div
                          className={cn(
                            "font-bold transition-colors",
                            selectedLocationId === loc.id
                              ? "text-red-600"
                              : "text-gray-900",
                          )}
                        >
                          {loc.title}
                        </div>
                        <div className="text-sm font-medium text-gray-500 mt-1 font-mono">
                          {loc.address}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {loc.description}
                    </p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
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
            disabled={!selectedLocationId}
            className="px-10 h-14 bg-red-600 hover:bg-black text-white font-bold tracking-widest shadow-xl shadow-red-200 disabled:opacity-50 transition-all duration-300"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectionPage;
