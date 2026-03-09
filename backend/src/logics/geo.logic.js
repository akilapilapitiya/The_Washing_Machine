import axios from "axios";
import { ValidationError } from "../utils/errors.util.js";

import { GOOGLE_MAPS_API_KEY } from "../configs/env.js";
// HQ Coordinates (Pannipitiya - 488 High Level Road)
const HQ_LAT = 6.8485;
const HQ_LNG = 79.9525;

// Haversine formula for fallback/validation
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const getTravelDetails = async (
  destLat,
  destLng,
  locationType = "branch",
) => {
  // If it's a branch visit, no travel needed for the team (or minimal)
  if (locationType !== "home") {
    return {
      distance: 0,
      duration: 0, // minutes
    };
  }

  // Validate coordinates
  if (!destLat || !destLng) {
    throw new ValidationError(
      "Location coordinates are required for home visits.",
    );
  }

  let distanceKm = 0;
  let durationMins = 0;

  try {
    if (GOOGLE_MAPS_API_KEY) {
      // Use Google Distance Matrix API
      const origins = `${HQ_LAT},${HQ_LNG}`;
      const destinations = `${destLat},${destLng}`;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await axios.get(url);
      const data = response.data;

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const element = data.rows[0].elements[0];
        distanceKm = element.distance.value / 1000; // meters to km
        durationMins = Math.ceil(element.duration.value / 60); // seconds to mins
      } else {
        console.warn("Google Maps API returned non-OK status:", data);
        // Fallback to Haversine
        distanceKm = calculateHaversineDistance(
          HQ_LAT,
          HQ_LNG,
          destLat,
          destLng,
        );
        durationMins = Math.ceil(distanceKm * 2); // Rough estimate: 30km/h avg speed -> 2 mins per km
      }
    } else {
      // Fallback if no API key
      console.warn("GOOGLE_MAPS_API_KEY not found, using Haversine.");
      distanceKm = calculateHaversineDistance(HQ_LAT, HQ_LNG, destLat, destLng);
      durationMins = Math.ceil(distanceKm * 2);
    }
  } catch (err) {
    console.error("Error calculating travel details:", err.message);
    // Fallback on error
    distanceKm = calculateHaversineDistance(HQ_LAT, HQ_LNG, destLat, destLng);
    durationMins = Math.ceil(distanceKm * 2);
  }

  // Round distance for pricing safety
  distanceKm = parseFloat(distanceKm.toFixed(2));

  return {
    distance: distanceKm,
    duration: durationMins,
  };
};
