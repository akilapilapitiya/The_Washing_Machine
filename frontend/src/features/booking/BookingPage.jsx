import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import VehicleCard from "./VehicleCard";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import * as vehicleService from "@/services/vehicle.service";
import { Card, CardContent } from "@/components/ui/card";

const BookingPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const vehicles = await vehicleService.getVehicles();
      setVehicles(vehicles);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      setError(err.message || "Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Navigate to service selection with selected vehicle ID
    navigate("/booking/services", { state: { vehicleId: selectedVehicleId } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Book Service
          </p>
          <h1 className="text-3xl font-bold">Select a vehicle</h1>
          <p className="text-gray-600">
            Choose one of your registered vehicles to continue the booking.
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading your vehicles...</p>
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">
                You don't have any vehicles registered yet. Add one to continue.
              </p>
              <Link to="/dashboard/vehicles">
                <Button>
                  <Plus size={18} className="mr-2" />
                  Add Your First Vehicle
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={{
                    id: vehicle.id,
                    make: vehicle.vehbrand,
                    model: vehicle.vehmodel,
                    plate: vehicle.vehplate,
                  }}
                  selected={vehicle.id === selectedVehicleId}
                  onSelect={setSelectedVehicleId}
                />
              ))}
              <Link to="/dashboard/vehicles" className="h-full">
                <div className="h-full rounded-xl border border-dashed border-gray-300 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-sm">
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div className="flex items-center gap-3 text-blue-700">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <Plus size={18} />
                      </span>
                      <div>
                        <p className="text-base font-semibold">
                          Add another vehicle
                        </p>
                        <p className="text-sm text-gray-600">
                          Save time at drop-off by registering your ride now.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                      <span>Go to vehicles</span>
                      <span aria-hidden="true">&gt;</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Link to="/dashboard/vehicles">
                <Button variant="outline">
                  Can't find your vehicle? Add it
                </Button>
              </Link>
              <Button onClick={handleContinue} disabled={!selectedVehicleId}>
                Continue
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
