import React, { useState, useEffect, useMemo } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

// Default to Colombo, Sri Lanka if HQ is not set
const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };
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

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || DEFAULT_CENTER,
  );
  const [error, setError] = useState(null);

  // HQ Coordinates - hardcoded for now, or fetch from env
  const hqCoords = useMemo(() => DEFAULT_CENTER, []);

  const handleMapClick = (location) => {
    const distance = calculateDistance(
      hqCoords.lat,
      hqCoords.lng,
      location.lat,
      location.lng,
    );

    if (distance > MAX_RADIUS_KM) {
      const msg = `Location is ${distance.toFixed(1)}km away. We only service within ${MAX_RADIUS_KM}km of our HQ.`;
      setError(msg);
      toast.error(msg);
      return;
    }

    setError(null);
    setSelectedLocation(location);
    onLocationSelect({ ...location, distance });
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        Google Maps API Key is missing. Please check your configuration.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={selectedLocation}
            defaultZoom={DEFAULT_ZOOM}
            mapId="DEMO_MAP_ID" // Required for AdvancedMarker
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
              <Pin
                background={"#DC2626"}
                glyphColor={"#fff"}
                borderColor={"#991B1B"}
              />
            </AdvancedMarker>

            {/* Service Radius Circle - Visual guide (Optional implementation) */}
            {/* To draw circle we'd need another simplified component or use Google Maps Circle object via useEffect */}
          </Map>
        </APIProvider>

        {/* Overlay instructions */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-xs text-sm text-gray-700 z-10">
          <p className="font-semibold flex items-center gap-2">
            <MapPin size={16} className="text-red-600" />
            Tap map to select location
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Must be within {MAX_RADIUS_KM}km of our HQ (Blue marker).
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <MapPin size={16} /> {error}
        </div>
      )}

      {!error && selectedLocation && (
        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
          <MapPin size={16} />
          Selected Location: {selectedLocation.lat.toFixed(6)},{" "}
          {selectedLocation.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
