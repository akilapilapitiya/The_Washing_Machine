import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import LocationPicker from "@/components/common/LocationPicker";

const locations = [
  {
    id: "main-branch",
    title: "The Washing Machine - Main Branch",
    type: "branch",
    address: "488, High level Road, Pannipitiya, Colombo, Sri Lanka",
    lat: 6.8485,
    lng: 79.9525,
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
  const [mapLocation, setMapLocation] = useState(null);

  const { vehicleId, serviceIds } = location.state || {};

  const handleContinue = () => {
    // Navigate to employee selection with all booking data
    // If home-visit, pass the mapLocation (lat, lng, distance)
    const locationData =
      selectedLocationId === "home-visit"
        ? {
            id: "home-visit",
            type: "home",
            ...mapLocation, // { lat, lng, distance }
          }
        : {
            id: "main-branch",
            type: "branch",
            lat: null,
            lng: null,
            distance: 0,
          };

    navigate("/dashboard/booking/employee", {
      state: { vehicleId, serviceIds, locationData },
    });
  };

  const handleLocationSelect = (location) => {
    setMapLocation(location);
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

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          {locations.map((loc) => {
            const Icon = loc.icon;
            const isSelected = selectedLocationId === loc.id;

            return (
              <div key={loc.id} className="w-full">
                <button
                  type="button"
                  onClick={() => setSelectedLocationId(loc.id)}
                  className="w-full text-left transition-all duration-200 focus:outline-none"
                  aria-pressed={isSelected}
                >
                  <Card
                    className={cn(
                      "h-full border transition-all duration-200 relative overflow-hidden active:scale-[0.98]",
                      isSelected
                        ? "border-red-600 shadow-md bg-red-50/10 ring-1 ring-red-600"
                        : "border-gray-200 hover:border-red-300 hover:shadow-md bg-white shadow-sm",
                    )}
                  >
                    <CardHeader className="pb-3 pt-6 px-6">
                      <CardTitle className="flex items-start gap-4">
                        <span
                          className={cn(
                            "flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                            isSelected
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
                              isSelected ? "text-red-700" : "text-gray-900",
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

                {/* Render Map if this is Home Visit and selected */}
                {loc.id === "home-visit" && isSelected && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Card className="border-red-100 shadow-inner bg-red-50/30">
                      <CardContent className="p-4">
                        <div className="space-y-2 mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin size={16} className="text-red-600" />
                            Pinpoint your location
                          </h4>
                          <p className="text-xs text-gray-500">
                            Tap on the map to set your precise location for the
                            service team.
                          </p>
                        </div>
                        <LocationPicker
                          onLocationSelect={handleLocationSelect}
                        />

                        {mapLocation && mapLocation.distance && (
                          <div className="mt-4 p-3 bg-white rounded-lg border border-red-100 shadow-sm">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 font-medium">
                                Travel Distance:
                              </span>
                              <span className="font-bold text-gray-900">
                                {mapLocation.distance.toFixed(1)} km
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                              <span className="text-gray-600 font-medium">
                                Est. Travel Time:
                              </span>
                              <span className="font-bold text-gray-900">
                                {mapLocation.duration} mins
                              </span>
                            </div>
                            {mapLocation.address && (
                              <div className="mt-2 text-xs text-gray-500 border-t pt-2 border-gray-100">
                                {mapLocation.address}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
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
            disabled={
              !selectedLocationId ||
              (selectedLocationId === "home-visit" && !mapLocation)
            }
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
