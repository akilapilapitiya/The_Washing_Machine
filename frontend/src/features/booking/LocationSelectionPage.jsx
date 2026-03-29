import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Home,
  Navigation,
  ArrowRight,
  Loader2,
  Building2,
  ExternalLink,
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import LocationPicker from "@/components/common/LocationPicker";
import { getPricingRules } from "@/services/settings.service";
import { useAuth } from "@/contexts/AuthContext";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import BookingFlowToolbar, {
  BookingToolbarBackButton,
  BookingToolbarActionButton,
} from "@/components/common/BookingFlowToolbar";

const HQ_COORDS = { lat: 6.8485, lng: 79.9525 };
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const LocationSelectionPage = () => {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedOptionId, setSelectedOptionId] = useState("main-branch");
  const [customMapLocation, setCustomMapLocation] = useState(null);
  const [myHomeLocation, setMyHomeLocation] = useState(null);
  const [myHomeCalculating, setMyHomeCalculating] = useState(false);
  const [pricingRules, setPricingRules] = useState(null);

  const { vehicleId, serviceIds } = routerLocation.state || {};

  const customerLat = user?.latitude != null ? parseFloat(user.latitude) : null;
  const customerLng =
    user?.longitude != null ? parseFloat(user.longitude) : null;
  const hasHomeLocation = customerLat !== null && customerLng !== null;

  useEffect(() => {
    getPricingRules()
      .then(setPricingRules)
      .catch(() => {});
  }, []);

  const calculateCost = useCallback(
    (distance) => {
      if (!pricingRules || !distance) return 0;
      const { base_km, base_fee, additional_rate } = pricingRules;
      return distance <= base_km
        ? base_fee
        : base_fee + (distance - base_km) * additional_rate;
    },
    [pricingRules],
  );

  const calculateMyHomeDistance = useCallback(async () => {
    if (!hasHomeLocation) return;
    setMyHomeCalculating(true);
    try {
      const dist = haversineKm(
        HQ_COORDS.lat,
        HQ_COORDS.lng,
        customerLat,
        customerLng,
      );
      setMyHomeLocation({
        lat: customerLat,
        lng: customerLng,
        distance: dist,
        duration: Math.ceil(dist * 2),
        isEstimate: true,
      });
    } finally {
      setMyHomeCalculating(false);
    }
  }, [hasHomeLocation, customerLat, customerLng]);

  useEffect(() => {
    if (selectedOptionId === "my-home" && hasHomeLocation && !myHomeLocation) {
      calculateMyHomeDistance();
    }
  }, [
    selectedOptionId,
    hasHomeLocation,
    myHomeLocation,
    calculateMyHomeDistance,
  ]);

  const travelCost = useMemo(() => {
    if (selectedOptionId === "my-home" && myHomeLocation)
      return calculateCost(myHomeLocation.distance);
    if (selectedOptionId === "custom" && customMapLocation)
      return calculateCost(customMapLocation.distance);
    return 0;
  }, [selectedOptionId, myHomeLocation, customMapLocation, calculateCost]);

  const isContinueEnabled = useMemo(() => {
    if (selectedOptionId === "main-branch") return true;
    if (selectedOptionId === "my-home")
      return hasHomeLocation && !!myHomeLocation;
    if (selectedOptionId === "custom") return !!customMapLocation;
    return false;
  }, [selectedOptionId, hasHomeLocation, myHomeLocation, customMapLocation]);

  const handleContinue = useCallback(() => {
    let locationData;
    if (selectedOptionId === "main-branch") {
      locationData = {
        id: "main-branch",
        type: "branch",
        lat: null,
        lng: null,
        distance: 0,
        travelCost: 0,
      };
    } else if (selectedOptionId === "my-home") {
      locationData = {
        id: "my-home",
        type: "home",
        ...myHomeLocation,
        travelCost,
      };
    } else {
      locationData = {
        id: "custom",
        type: "home",
        ...customMapLocation,
        travelCost,
      };
    }
    navigate("/dashboard/booking/employee", {
      state: { vehicleId, serviceIds, locationData },
    });
  }, [
    selectedOptionId,
    myHomeLocation,
    customMapLocation,
    travelCost,
    vehicleId,
    serviceIds,
    navigate,
  ]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const selectedOptionLabel = useMemo(() => {
    if (selectedOptionId === "main-branch") return "Main Branch";
    if (selectedOptionId === "my-home") return "My Home";
    return "Custom Location";
  }, [selectedOptionId]);

  const locationOptions = useMemo(
    () => [
      {
        id: "main-branch",
        label: "Main Branch",
        icon: Building2,
        disabled: false,
      },
      {
        id: "my-home",
        label: "My Home",
        icon: Home,
        disabled: !hasHomeLocation,
      },
      {
        id: "custom",
        label: "Custom Location",
        icon: Navigation,
        disabled: false,
      },
    ],
    [hasHomeLocation],
  );

  // ── Toolbar: location options + continue ────────────────────────────────
  const toolbar = useMemo(() => {
    return (
      <BookingFlowToolbar
        tabs={locationOptions}
        activeTab={selectedOptionId}
        onTabChange={setSelectedOptionId}
        tabsAriaLabel="Location options"
        rightSlot={
          <>
            <BookingToolbarBackButton onClick={handleBack} />
            <BookingToolbarActionButton
              onClick={handleContinue}
              disabled={!isContinueEnabled}
            >
              <span>Next</span>
              <ArrowRight size={14} className="ml-2" />
            </BookingToolbarActionButton>
          </>
        }
      />
    );
  }, [
    locationOptions,
    selectedOptionId,
    handleBack,
    handleContinue,
    isContinueEnabled,
  ]);

  useSetPageHeader(
    "BOOK SERVICE",
    "Select Service Location",
    "Choose where you would like the service to take place.",
    null,
    toolbar,
  );

  // ── Map state ────────────────────────────────────────────────────────────
  const mapCenter =
    selectedOptionId === "my-home" && hasHomeLocation
      ? { lat: customerLat, lng: customerLng }
      : HQ_COORDS;

  const selectedLocationDetails = useMemo(() => {
    if (selectedOptionId === "main-branch") {
      return {
        type: "Main Branch Service Center",
        coordinates: "6.8485, 79.9525",
        distance: "0.0 km",
        duration: "—",
        fee: "Rs. 0.00",
        note: "No travel fee — you visit the branch.",
      };
    }

    if (selectedOptionId === "my-home") {
      if (!hasHomeLocation) {
        return {
          type: "My Home",
          coordinates: "Not configured",
          distance: "—",
          duration: "—",
          fee: "—",
          note: "Home coordinates not found. Update your profile location.",
        };
      }

      if (myHomeCalculating || !myHomeLocation) {
        return {
          type: "My Home",
          coordinates: `${customerLat?.toFixed(6)}, ${customerLng?.toFixed(6)}`,
          distance: "Calculating...",
          duration: "Calculating...",
          fee: "Calculating...",
          note: "Calculating route and travel estimate.",
        };
      }

      return {
        type: "My Home",
        coordinates: `${customerLat?.toFixed(6)}, ${customerLng?.toFixed(6)}`,
        distance: `${myHomeLocation.distance.toFixed(1)} km${myHomeLocation.isEstimate ? " (est.)" : ""}`,
        duration: `${myHomeLocation.duration} min`,
        fee: `Rs. ${travelCost.toFixed(2)}`,
        note: "Estimated based on your saved home location.",
      };
    }

    if (!customMapLocation) {
      return {
        type: "Custom Location",
        coordinates: "Not selected",
        distance: "—",
        duration: "—",
        fee: "—",
        note: "Drop a pin on the map to select a custom location.",
      };
    }

    return {
      type: "Custom Location",
      coordinates: `${customMapLocation.lat?.toFixed(6)}, ${customMapLocation.lng?.toFixed(6)}`,
      distance: `${customMapLocation.distance?.toFixed(1)} km`,
      duration: customMapLocation.duration
        ? `${customMapLocation.duration} min`
        : "—",
      fee: `Rs. ${travelCost.toFixed(2)}`,
      note: customMapLocation.address || "Custom map location selected.",
    };
  }, [
    selectedOptionId,
    hasHomeLocation,
    myHomeCalculating,
    myHomeLocation,
    customMapLocation,
    travelCost,
    customerLat,
    customerLng,
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.45fr] gap-4 items-start">
          <div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm font-bold text-gray-900">
                  Location Details
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2.5 font-semibold text-gray-600 w-32">
                        Type
                      </td>
                      <td className="px-4 py-2.5 text-gray-900">
                        {selectedLocationDetails.type}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2.5 font-semibold text-gray-600">
                        Coordinates
                      </td>
                      <td className="px-4 py-2.5 text-gray-900 font-mono text-xs">
                        {selectedLocationDetails.coordinates}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2.5 font-semibold text-gray-600">
                        Distance
                      </td>
                      <td className="px-4 py-2.5 text-gray-900">
                        {selectedLocationDetails.distance}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2.5 font-semibold text-gray-600">
                        Travel Time
                      </td>
                      <td className="px-4 py-2.5 text-gray-900">
                        {selectedLocationDetails.duration}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-gray-600">
                        Est. Travel Fee
                      </td>
                      <td className="px-4 py-2.5 text-red-600 font-semibold">
                        {selectedLocationDetails.fee}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                {selectedLocationDetails.note}
                {selectedOptionId === "my-home" && !hasHomeLocation && (
                  <Link
                    to="/dashboard/profile"
                    className="inline-flex items-center gap-1.5 ml-2 text-red-600 hover:text-red-700 font-medium"
                  >
                    <ExternalLink size={12} /> Update profile location
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900">Map Preview</p>
                <span className="text-xs font-medium text-gray-500">
                  {selectedOptionLabel}
                </span>
              </div>
              {selectedOptionId === "custom" ? (
                <LocationPicker
                  onLocationSelect={setCustomMapLocation}
                  mapHeight="h-[460px] xl:h-[500px]"
                />
              ) : (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <div className="h-[460px] xl:h-[500px] relative">
                    <Map
                      key={selectedOptionId}
                      defaultCenter={mapCenter}
                      defaultZoom={
                        selectedOptionId === "my-home" && hasHomeLocation
                          ? 12
                          : 15
                      }
                      mapId="DEMO_MAP_ID"
                      clickableIcons={false}
                      gestureHandling="cooperative"
                      className="w-full h-full"
                    >
                      {/* HQ marker */}
                      <AdvancedMarker
                        position={HQ_COORDS}
                        title="The Washing Machine — Main Branch"
                      >
                        <div className="relative flex flex-col items-center">
                          <div className="bg-red-600 text-white px-2.5 py-1.5 rounded-lg shadow-lg border-2 border-white flex items-center gap-1.5">
                            <Building2 size={13} fill="currentColor" />
                            <span className="text-xs font-bold whitespace-nowrap">
                              The Washing Machine
                            </span>
                          </div>
                          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-red-600 -mt-px" />
                        </div>
                      </AdvancedMarker>

                      {/* Home marker */}
                      {selectedOptionId === "my-home" && hasHomeLocation && (
                        <AdvancedMarker
                          position={{ lat: customerLat, lng: customerLng }}
                          title="Your Home"
                        >
                          <div className="relative flex flex-col items-center">
                            <div className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg shadow-lg border-2 border-white flex items-center gap-1.5">
                              <Home size={13} fill="currentColor" />
                              <span className="text-xs font-bold">
                                Your Home
                              </span>
                            </div>
                            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-blue-600 -mt-px" />
                          </div>
                        </AdvancedMarker>
                      )}
                    </Map>

                    {/* Calculating overlay for my-home */}
                    {selectedOptionId === "my-home" && myHomeCalculating && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
                          <Loader2 className="animate-spin text-red-600 h-5 w-5" />
                          <span className="text-sm font-medium text-gray-700">
                            Calculating route…
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </APIProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectionPage;
