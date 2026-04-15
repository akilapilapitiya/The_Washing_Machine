import React, { useState, useEffect, useMemo } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

// Default to Pannipitiya (HQ)
const DEFAULT_CENTER = { lat: 6.8485, lng: 79.9525 };
const DEFAULT_ZOOM = 13;

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// Radius in KM
const MAX_RADIUS_KM = Number(import.meta.env.VITE_MAX_BOOKING_RADIUS_KM) || 30;

// Helper to calculate distance between two coords using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Component to handle map clicks
const MapEvents = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("click", (e) => {
      onMapClick({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    });
    return () => google.maps.event.removeListener(listener);
  }, [map, onMapClick]);

  return null;
};

const LocationPicker = ({
  onLocationSelect,
  initialLocation,
  mapHeight = "h-[400px]",
}) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || DEFAULT_CENTER,
  );
  const [error, setError] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // HQ Coordinates
  const hqCoords = useMemo(() => DEFAULT_CENTER, []);

  const calculateDrivingDistance = async (destination) => {
    if (!window.google || !window.google.maps) return;

    setCalculating(true);
    setError(null);

    try {
      // Use new Routes API (replaces deprecated DistanceMatrixService)
      const { RoutesLibrary } = await google.maps.importLibrary("routes");
      const routeMatrix = new RoutesLibrary.RouteMatrixService();

      const request = {
        origins: [
          {
            waypoint: {
              location: {
                latLng: { latitude: hqCoords.lat, longitude: hqCoords.lng },
              },
            },
          },
        ],
        destinations: [
          {
            waypoint: {
              location: {
                latLng: {
                  latitude: destination.lat,
                  longitude: destination.lng,
                },
              },
            },
          },
        ],
        travelMode: google.maps.TravelMode.DRIVING,
      };

      const response = await routeMatrix.computeRouteMatrix(request);
      const element = response?.[0];

      if (element && element.status === "OK") {
        const distanceKm = (element.distanceMeters || 0) / 1000;
        const durationMins = Math.ceil((element.duration?.seconds || 0) / 60);

        if (distanceKm > MAX_RADIUS_KM) {
          const msg = `Location is ${distanceKm.toFixed(1)}km away (Driving). We only service within ${MAX_RADIUS_KM}km of our HQ.`;
          setError(msg);
          toast.error(msg);
          onLocationSelect(null);
        } else {
          onLocationSelect({
            lat: destination.lat,
            lng: destination.lng,
            distance: distanceKm,
            duration: durationMins,
          });
        }
      } else {
        throw new Error(element?.status || "No route found");
      }
    } catch (err) {
      console.warn(
        "Routes API failed, falling back to Haversine:",
        err.message,
      );
      // Fallback to Haversine formula
      const haversineDist = calculateDistance(
        hqCoords.lat,
        hqCoords.lng,
        destination.lat,
        destination.lng,
      );
      if (haversineDist > MAX_RADIUS_KM) {
        const msg = `Location is too far (~${haversineDist.toFixed(1)}km). Limit is ${MAX_RADIUS_KM}km.`;
        setError(msg);
        toast.error(msg);
        onLocationSelect(null);
      } else {
        onLocationSelect({
          lat: destination.lat,
          lng: destination.lng,
          distance: haversineDist,
          duration: Math.ceil(haversineDist * 2),
          isEstimate: true,
        });
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleMapClick = (location) => {
    setSelectedLocation(location);
    // Trigger calculation
    calculateDrivingDistance(location);
  };

  return (
    <div className="space-y-4">
      <div
        className={`${mapHeight} w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative`}
      >
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
          <Map
            defaultCenter={selectedLocation}
            defaultZoom={DEFAULT_ZOOM}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={false}
            clickableIcons={false}
          >
            <MapEvents onMapClick={handleMapClick} />

            {/* HQ Marker */}
            <AdvancedMarker position={hqCoords} title="Our HQ">
              <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
                <MapPin size={20} fill="currentColor" />
              </div>
            </AdvancedMarker>

            {/* Selected Location Marker */}
            <AdvancedMarker position={selectedLocation}>
              <div className="bg-red-600 text-white p-2 rounded-full shadow-lg border-2 border-red-800 flex items-center justify-center">
                <MapPin size={20} fill="currentColor" />
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>

        {/* Overlay instructions */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-xs text-sm text-gray-700 z-10">
          <p className="font-semibold flex items-center gap-2">
            <MapPin size={16} className="text-red-600" />
            Tap map to select location
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max Radius: {MAX_RADIUS_KM}km (Driving)
          </p>
        </div>

        {calculating && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-20">
            <div className="bg-white p-3 rounded-lg shadow-lg flex items-center gap-2">
              <Loader2 className="animate-spin text-red-600" size={20} />
              <span className="text-sm font-medium">Calculating route...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
          <MapPin size={16} /> {error}
        </div>
      )}

      {!error && selectedLocation && !calculating && (
        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
          <MapPin size={16} />
          <div>
            <p className="font-medium">Selected Location Confirmed</p>
            <p className="text-xs opacity-90">
              Coordinates: {selectedLocation.lat.toFixed(4)},{" "}
              {selectedLocation.lng.toFixed(4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
