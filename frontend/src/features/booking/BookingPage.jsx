import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import VehicleCard from "./VehicleCard";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Loader2 Car, ArrowRight } from "lucide-react";
import * as vehicleService from "@/services/vehicle.service";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { toast } from "sonner";
const BookingPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      toast.error(null);
      const vehicles = await vehicleService.getVehicles();
      setVehicles(vehicles);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      toast.error(err.message || "Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/dashboard/booking/services", {
      state: { vehicleId: selectedVehicleId }});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-600">Book Service</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Select a vehicle
          </h1>
          <p className="text-gray-600">
            Choose one of your registered vehicles to continue the booking.
          </p>
        </div>

{loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-600" />
                <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                Loading vehicles...
              </p>
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="border border-dashed border-gray-200 bg-white shadow-none">
            <CardContent className="text-center py-12 space-y-4">
              <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Car size={24} className="text-gray-400" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  No Vehicles Found
                </p>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  You don't have any vehicles registered yet. Add one to get
                  started.
                </p>
              </div>
              <Link to="/dashboard/vehicles" className="inline-block mt-2">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 h-10 shadow-sm">
                  <Plus size={18} className="mr-2" />
                  Add Vehicle
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
                    plate: vehicle.vehplate}}
                  selected={vehicle.id === selectedVehicleId}
                  onSelect={setSelectedVehicleId}
                />
              ))}
              <Link to="/dashboard/vehicles" className="h-full">
                <div className="group h-full rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-6 text-left transition-all duration-200 hover:border-red-400 hover:bg-red-50 hover:shadow-sm">
                  <div className="flex h-full flex-col justify-center items-center gap-3 py-4 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 transition-all duration-200 group-hover:border-red-200 group-hover:text-red-600">
                      <Plus size={20} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                        Add New Vehicle
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Register another car
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-end pt-6 border-t border-gray-100">
              <Link to="/dashboard/vehicles">
                <Button
                  variant="outline"
                  className="px-6 h-11 font-medium text-gray-700"
                >
                  Manage Garage
                </Button>
              </Link>
              <Button
                onClick={handleContinue}
                disabled={!selectedVehicleId}
                className="px-8 h-11 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all duration-200 disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
