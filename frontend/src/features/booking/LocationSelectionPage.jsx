import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Home,
  Navigation,
  ArrowRight,
  Loader2,
  Building2,
  ExternalLink,
  CheckCircle2,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import LocationPicker from "@/components/common/LocationPicker";
import { getPricingRules } from "@/services/settings.service";
import { useAuth } from "@/contexts/AuthContext";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

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
  const customerLng = user?.longitude != null ? parseFloat(user.longitude) : null;
  const hasHomeLocation = customerLat !== null && customerLng !== null;

  useEffect(() => {
    getPricingRules().then(setPricingRules).catch(() => {});
  }, []);

  const calculateCost = useCallback(
    (distance) => {
      if (!pricingRules || !distance) return 0;
      const { base_km, base_fee, additional_rate } = pricingRules;
      return distance <= base_km
        ? base_fee
        : base_fee + (distance - base_km) * additional_rate;
    },
    [pricingRules]
  );

  const calculateMyHomeDistance = useCallback(async () => {
    if (!hasHomeLocation) return;
    setMyHomeCalculating(true);
    try {
      const dist = haversineKm(HQ_COORDS.lat, HQ_COORDS.lng, customerLat, customerLng);
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
  }, [selectedOptionId, hasHomeLocation, myHomeLocation, calculateMyHomeDistance]);

  const travelCost = useMemo(() => {
    if (selectedOptionId === "my-home" && myHomeLocation)
      return calculateCost(myHomeLocation.distance);
    if (selectedOptionId === "custom" && customMapLocation)
      return calculateCost(customMapLocation.distance);
    return 0;
  }, [selectedOptionId, myHomeLocation, customMapLocation, calculateCost]);

  const isContinueEnabled = useMemo(() => {
    if (selectedOptionId === "main-branch") return true;
    if (selectedOptionId === "my-home") return hasHomeLocation && !!myHomeLocation;
    if (selectedOptionId === "custom") return !!customMapLocation;
    return false;
  }, [selectedOptionId, hasHomeLocation, myHomeLocation, customMapLocation]);

  const handleContinue = useCallback(() => {
    let locationData;
    if (selectedOptionId === "main-branch") {
      locationData = { id: "main-branch", type: "branch", lat: null, lng: null, distance: 0, travelCost: 0 };
    } else if (selectedOptionId === "my-home") {
      locationData = { id: "my-home", type: "home", ...myHomeLocation, travelCost };
    } else {
      locationData = { id: "custom", type: "home", ...customMapLocation, travelCost };
    }
    navigate("/dashboard/booking/employee", { state: { vehicleId, serviceIds, locationData } });
  }, [selectedOptionId, myHomeLocation, customMapLocation, travelCost, vehicleId, serviceIds, navigate]);

  // ── Toolbar: 3 pill options + Continue ──────────────────────────────────
  const toolbar = useMemo(() => {
    const opts = [
      { id: "main-branch", icon: Building2, label: "Main Branch" },
      { id: "my-home",     icon: Home,      label: "My Home",    disabled: !hasHomeLocation },
      { id: "custom",      icon: Navigation, label: "Custom Location" },
    ];
    return (
      <div className="flex items-center gap-2 w-full justify-between flex-wrap">
        {/* Pill group */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {opts.map(({ id, icon: Icon, label, disabled }) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setSelectedOptionId(id)}
              title={disabled ? "No home location saved in your profile" : undefined}
              className={cn(
                "flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium transition-all duration-150 whitespace-nowrap",
                selectedOptionId === id
                  ? "bg-red-600 text-white shadow-sm"
                  : disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Continue */}
        <Button
          onClick={handleContinue}
          disabled={!isContinueEnabled}
          className="px-6 h-9 bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-sm disabled:opacity-50 flex-shrink-0"
        >
          <span>Next</span>
          <ArrowRight size={14} className="ml-2" />
        </Button>
      </div>
    );
  }, [selectedOptionId, hasHomeLocation, handleContinue, isContinueEnabled]);

  useSetPageHeader(
    "BOOK SERVICE",
    "Select Service Location",
    "Choose where you would like the service to take place.",
    null,
    toolbar
  );

  // ── Map state ────────────────────────────────────────────────────────────
  const mapCenter =
    selectedOptionId === "my-home" && hasHomeLocation
      ? { lat: customerLat, lng: customerLng }
      : HQ_COORDS;

  const cost = travelCost;

  // ── Info panel content per option ────────────────────────────────────────
  const InfoPanel = () => {
    if (selectedOptionId === "main-branch") {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Service Station</p>
            <p className="text-base font-bold text-gray-900">The Washing Machine</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">488, High Level Road, Pannipitiya, Colombo, Sri Lanka</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Coordinates</p>
              <p className="text-xs font-mono font-semibold text-gray-700">6.8485, 79.9525</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Type</p>
              <p className="text-xs font-semibold text-gray-700">Service Center</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
            <p className="text-xs text-green-700 font-medium">No travel fee — you visit the branch</p>
          </div>
        </div>
      );
    }

    if (selectedOptionId === "my-home") {
      if (!hasHomeLocation) {
        return (
          <div className="space-y-3">
            <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-3">
              <p className="text-sm font-semibold text-orange-700">No home location saved</p>
              <p className="text-xs text-orange-600 mt-1">Add your coordinates in profile settings to use this option.</p>
            </div>
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <ExternalLink size={13} /> Update location in Profile
            </Link>
          </div>
        );
      }
      if (myHomeCalculating) {
        return (
          <div className="flex items-center gap-3 py-4 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin text-red-600" />
            Calculating route distance…
          </div>
        );
      }
      if (myHomeLocation) {
        return (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Saved Home Location</p>
              <p className="text-xs font-mono font-semibold text-gray-700">
                {customerLat?.toFixed(6)}, {customerLng?.toFixed(6)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-0.5">Distance</p>
                <p className="text-sm font-bold text-gray-800">
                  {myHomeLocation.distance.toFixed(1)} km
                  {myHomeLocation.isEstimate && <span className="text-xs font-normal text-gray-400 ml-1">(est.)</span>}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-0.5">Travel Time</p>
                <p className="text-sm font-bold text-gray-800">{myHomeLocation.duration} min</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 flex items-center justify-between">
              <p className="text-xs text-gray-600 font-medium">Est. Travel Fee</p>
              <p className="text-sm font-bold text-red-600">Rs. {cost.toFixed(2)}</p>
            </div>
          </div>
        );
      }
    }

    if (selectedOptionId === "custom") {
      if (!customMapLocation) {
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-800 mb-1">Drop a pin on the map</p>
              <p className="text-xs text-blue-600 leading-relaxed">Click anywhere on the map to choose your custom service location. We'll calculate the travel distance automatically.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Service Radius</p>
              <p className="text-xs font-semibold text-gray-700">Up to 30 km from the branch</p>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Selected Location</p>
            {customMapLocation.address && (
              <p className="text-sm text-gray-700 leading-relaxed">{customMapLocation.address}</p>
            )}
            <p className="text-xs font-mono text-gray-500 mt-1">
              {customMapLocation.lat?.toFixed(6)}, {customMapLocation.lng?.toFixed(6)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Distance</p>
              <p className="text-sm font-bold text-gray-800">
                {customMapLocation.distance?.toFixed(1)} km
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Travel Time</p>
              <p className="text-sm font-bold text-gray-800">
                {customMapLocation.duration ? `${customMapLocation.duration} min` : "—"}
              </p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 flex items-center justify-between">
            <p className="text-xs text-gray-600 font-medium">Est. Travel Fee</p>
            <p className="text-sm font-bold text-red-600">Rs. {cost.toFixed(2)}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

          {/* ── Left info panel ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Coloured header strip keyed to option */}
              <div className={cn(
                "px-5 py-4 flex items-center gap-3",
                selectedOptionId === "main-branch" ? "bg-red-600" :
                selectedOptionId === "my-home" ? "bg-blue-600" :
                "bg-gray-700"
              )}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  {selectedOptionId === "main-branch" && <Building2 size={16} className="text-white" />}
                  {selectedOptionId === "my-home"     && <Home size={16} className="text-white" />}
                  {selectedOptionId === "custom"      && <Navigation size={16} className="text-white" />}
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">
                    {selectedOptionId === "main-branch" && "Main Branch"}
                    {selectedOptionId === "my-home"     && "My Home"}
                    {selectedOptionId === "custom"      && "Custom Location"}
                  </p>
                  <p className="text-white/70 text-xs">
                    {selectedOptionId === "main-branch" && "Fixed service station"}
                    {selectedOptionId === "my-home"     && "We come to you"}
                    {selectedOptionId === "custom"      && "Choose any location"}
                  </p>
                </div>
                {isContinueEnabled && (
                  <CheckCircle2 size={18} className="text-white/80 ml-auto" />
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <InfoPanel />
              </div>
            </div>
          </div>

          {/* ── Right map panel ─────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {selectedOptionId === "custom" ? (
                <LocationPicker
                  onLocationSelect={setCustomMapLocation}
                  mapHeight="h-[440px]"
                />
              ) : (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <div className="h-[440px] relative">
                    <Map
                      key={selectedOptionId}
                      defaultCenter={mapCenter}
                      defaultZoom={selectedOptionId === "my-home" && hasHomeLocation ? 12 : 15}
                      mapId="DEMO_MAP_ID"
                      clickableIcons={false}
                      gestureHandling="cooperative"
                      className="w-full h-full"
                    >
                      {/* HQ marker */}
                      <AdvancedMarker position={HQ_COORDS} title="The Washing Machine — Main Branch">
                        <div className="relative flex flex-col items-center">
                          <div className="bg-red-600 text-white px-2.5 py-1.5 rounded-lg shadow-lg border-2 border-white flex items-center gap-1.5">
                            <Building2 size={13} fill="currentColor" />
                            <span className="text-xs font-bold whitespace-nowrap">The Washing Machine</span>
                          </div>
                          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-red-600 -mt-px" />
                        </div>
                      </AdvancedMarker>

                      {/* Home marker */}
                      {selectedOptionId === "my-home" && hasHomeLocation && (
                        <AdvancedMarker position={{ lat: customerLat, lng: customerLng }} title="Your Home">
                          <div className="relative flex flex-col items-center">
                            <div className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg shadow-lg border-2 border-white flex items-center gap-1.5">
                              <Home size={13} fill="currentColor" />
                              <span className="text-xs font-bold">Your Home</span>
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
                          <span className="text-sm font-medium text-gray-700">Calculating route…</span>
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
