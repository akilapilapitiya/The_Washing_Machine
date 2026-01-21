import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Car,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as vehicleService from "@/services/vehicle.service";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    vehbrand: "",
    vehmodel: "",
    vehmileage: "",
    vehplate: "",
  });

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const vehicleData = await vehicleService.getVehicles();
      // vehicleData is already response.data?.data?.vehicles from service
      setVehicles(vehicleData || []);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      setError(err.message || "Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const vehicleData = {
        vehplate: newVehicle.vehplate,
        vehmileage: parseInt(newVehicle.vehmileage) || 0,
        vehbrand: newVehicle.vehbrand,
        vehmodel: newVehicle.vehmodel,
      };

      await vehicleService.createVehicle(vehicleData);

      // Refresh the list
      await fetchVehicles();

      // Reset form
      setNewVehicle({
        vehbrand: "",
        vehmodel: "",
        vehmileage: "",
        vehplate: "",
      });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create vehicle:", err);
      setError(err.message || "Failed to add vehicle. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;

    try {
      setError(null);
      await vehicleService.deleteVehicle(vehicleToDelete.id);
      await fetchVehicles();
      setShowDeleteConfirm(false);
      setVehicleToDelete(null);
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      setError(err.message || "Failed to delete vehicle. Please try again.");
      setShowDeleteConfirm(false);
      setVehicleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setVehicleToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
              Garage
            </p>
            <h1 className="text-3xl font-bold italic tracking-tight uppercase text-gray-900">
              Manage your vehicles
            </h1>
            <p className="text-gray-600">
              Add, view, and manage all your machines in one high-performance
              vault.
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="h-14 px-8 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-lg shadow-red-200 transition-all duration-300 group"
            disabled={loading}
          >
            <Plus
              size={20}
              className="mr-2 group-hover:rotate-90 transition-transform"
            />
            Add Vehicle
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-2 border-red-100 rounded-xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle
              size={24}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <p className="text-red-800 font-black uppercase italic tracking-tight text-sm">
                Operation Failure
              </p>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Add Vehicle Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-red-600 shadow-2xl animate-in zoom-in-95 duration-300">
              <CardHeader className="bg-gray-900 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-black tracking-widest text-red-500">
                      Inventory Management
                    </p>
                    <CardTitle className="text-2xl font-black uppercase italic tracking-tight">
                      Add New Vehicle
                    </CardTitle>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-600 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleAddVehicle} className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehbrand"
                        className="text-xs uppercase font-black text-gray-400"
                      >
                        Brand Name *
                      </Label>
                      <Input
                        id="vehbrand"
                        name="vehbrand"
                        value={newVehicle.vehbrand}
                        onChange={handleInputChange}
                        placeholder="e.g., TOYOTA"
                        className="h-12 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-bold uppercase transition-all"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehmodel"
                        className="text-xs uppercase font-black text-gray-400"
                      >
                        Model *
                      </Label>
                      <Input
                        id="vehmodel"
                        name="vehmodel"
                        value={newVehicle.vehmodel}
                        onChange={handleInputChange}
                        placeholder="e.g., COROLLA"
                        className="h-12 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-bold uppercase transition-all"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehplate"
                        className="text-xs uppercase font-black text-gray-400"
                      >
                        Identity / Plate *
                      </Label>
                      <Input
                        id="vehplate"
                        name="vehplate"
                        value={newVehicle.vehplate}
                        onChange={handleInputChange}
                        placeholder="e.g., ABC-123"
                        className="h-12 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-mono font-bold tracking-widest transition-all"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehmileage"
                        className="text-xs uppercase font-black text-gray-400"
                      >
                        Mileage (KM)
                      </Label>
                      <Input
                        id="vehmileage"
                        name="vehmileage"
                        type="number"
                        value={newVehicle.vehmileage}
                        onChange={handleInputChange}
                        placeholder="e.g., 45000"
                        className="h-12 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-bold transition-all"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="h-14 px-8 border-2 font-black uppercase tracking-widest hover:bg-gray-50"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="h-14 px-10 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-xl shadow-red-200 transition-all duration-300"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={24} className="mr-2 animate-spin" />
                          Indexing...
                        </>
                      ) : (
                        "Register Machine"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-red-600" />
              <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
            </div>
            <p className="text-gray-400 font-bold uppercase italic tracking-widest text-xs">
              Accessing Garage Records...
            </p>
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && vehicles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="group border-2 border-transparent bg-white shadow-sm hover:border-red-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 h-1 bg-red-600 w-0 group-hover:w-full transition-all duration-500" />
                <button
                  onClick={() => handleDeleteClick(vehicle)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Remove from Garage"
                >
                  <Trash2 size={16} />
                </button>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-900 shadow-inner group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                      <Car size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-black text-red-600 tracking-widest mb-0.5">
                        Automobile
                      </p>
                      <CardTitle className="text-xl font-black uppercase italic tracking-tighter truncate leading-none">
                        {vehicle.vehbrand} {vehicle.vehmodel}
                      </CardTitle>
                      <p className="text-xs font-mono font-bold text-gray-400 tracking-widest mt-1 uppercase">
                        {vehicle.vehplate}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                        Brand
                      </p>
                      <p className="font-bold text-gray-900 uppercase text-sm truncate">
                        {vehicle.vehbrand}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                        Model
                      </p>
                      <p className="font-bold text-gray-900 uppercase text-sm truncate">
                        {vehicle.vehmodel}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                        Identity
                      </p>
                      <p className="font-mono font-black text-red-600 text-sm tracking-tight">
                        {vehicle.vehplate}
                      </p>
                    </div>
                    {vehicle.vehmileage != null && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                          Mileage
                        </p>
                        <p className="font-bold text-gray-900 text-sm">
                          {vehicle.vehmileage.toLocaleString()} KM
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && vehicleToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md border-2 border-red-600 shadow-2xl animate-in zoom-in-95 duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
                <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">
                  Confirm Eviction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-8">
                <p className="text-gray-600 text-center font-medium">
                  Are you absolutely sure you want to remove this machine from
                  your garage records?
                </p>
                <div className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 space-y-1 flex flex-col items-center">
                  <p className="text-[10px] uppercase font-black text-red-600 tracking-widest">
                    Selected Vehicle
                  </p>
                  <p className="font-black text-lg text-gray-900 uppercase italic">
                    {vehicleToDelete.vehbrand} {vehicleToDelete.vehmodel}
                  </p>
                  <p className="text-sm font-mono font-bold text-gray-400 uppercase">
                    {vehicleToDelete.vehplate}
                  </p>
                </div>
                <div className="flex flex-col gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="w-full h-14 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-xl shadow-red-200 transition-all duration-300 group"
                  >
                    <Trash2 size={20} className="mr-2" />
                    Confirm Removal
                  </Button>
                  <button
                    onClick={handleDeleteCancel}
                    className="w-full text-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors py-2"
                  >
                    Abort Action
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <Card className="border-2 border-dashed border-gray-200 bg-white shadow-none">
            <CardContent className="text-center py-20 space-y-6">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Car size={40} className="text-gray-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-gray-900">
                  Garage is Empty
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto font-medium">
                  Add your first high-performance machine to unlock premium car
                  care services.
                </p>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="h-14 px-10 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-xl shadow-red-200"
              >
                <Plus size={20} className="mr-2" />
                Initialize Garage
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VehiclesPage;
