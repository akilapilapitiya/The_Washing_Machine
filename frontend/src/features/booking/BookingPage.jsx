import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import VehicleCard from "./VehicleCard";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Loader2, AlertCircle, Car, ArrowRight } from "lucide-react";
import * as vehicleService from "@/services/vehicle.service";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    navigate("/booking/services", { state: { vehicleId: selectedVehicleId } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Book Service
          </p>
          <h1 className="text-3xl font-bold italic tracking-tight uppercase text-gray-900">
            Select a vehicle
          </h1>
          <p className="text-gray-600">
            Choose one of your registered vehicles to continue the booking.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-100 rounded-xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle
              size={24}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <p className="text-red-800 font-black uppercase italic tracking-tight">
                System Error
              </p>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchVehicles}
              className="font-bold border-red-200 text-red-600"
            >
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-red-600" />
                <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
              </div>
              <p className="text-gray-400 font-bold uppercase italic tracking-widest text-xs">
                Scanning Inventory...
              </p>
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200 bg-white">
            <CardContent className="text-center py-16 space-y-6">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Car size={32} className="text-gray-300" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black uppercase italic text-gray-900">
                  No Vehicles Found
                </p>
                <p className="text-gray-500 max-w-sm mx-auto">
                  You don't have any vehicles registered in our high-performance
                  database.
                </p>
              </div>
              <Link to="/dashboard/vehicles" className="inline-block">
                <Button className="bg-red-600 hover:bg-black font-black uppercase italic tracking-widest px-8 h-14 shadow-lg shadow-red-200">
                  <Plus size={20} className="mr-2" />
                  Add Your Machine
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="group h-full rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-left transition-all duration-300 hover:border-red-400 hover:bg-red-50/30">
                  <div className="flex h-full flex-col justify-between gap-8">
                    <div className="flex items-center gap-4">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white group-hover:rotate-90">
                        <Plus size={24} />
                      </span>
                      <div>
                        <p className="text-lg font-black uppercase italic text-gray-900 group-hover:text-red-600 transition-colors">
                          Add Machine
                        </p>
                        <p className="text-xs font-bold uppercase tracking-tight text-gray-400">
                          Register a new ride
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                      <span>Enter Garage</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 items-center pt-8 border-t border-gray-200">
              <Link to="/dashboard/vehicles">
                <Button
                  variant="outline"
                  className="px-8 h-14 border-2 font-bold uppercase tracking-wide hover:bg-gray-100"
                >
                  Manage Garage
                </Button>
              </Link>
              <Button
                onClick={handleContinue}
                disabled={!selectedVehicleId}
                className="px-10 h-14 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-xl shadow-red-200 disabled:opacity-50 disabled:shadow-none transition-all duration-300 group"
              >
                <span>Initialize Booking</span>
                <ArrowRight
                  size={20}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
