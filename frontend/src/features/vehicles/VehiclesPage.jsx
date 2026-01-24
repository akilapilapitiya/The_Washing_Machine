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
            <h1 className="text-3xl font-bold text-gray-900">
              Manage your vehicles
            </h1>
            <p className="text-gray-600">
              Add, view, and manage all your vehicles in one place.
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200"
            disabled={loading}
          >
            <Plus size={18} className="mr-2" />
            Add Vehicle
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-4">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <p className="text-red-800 font-bold text-sm">
                Operation Failure
              </p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Add Vehicle Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <CardHeader className="bg-white border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">
                      Add New Vehicle
                    </CardTitle>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddVehicle} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehbrand"
                        className="text-sm font-medium text-gray-700"
                      >
                        Brand Name *
                      </Label>
                      <Input
                        id="vehbrand"
                        name="vehbrand"
                        value={newVehicle.vehbrand}
                        onChange={handleInputChange}
                        placeholder="e.g., Toyota"
                        className="focus:ring-red-500"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehmodel"
                        className="text-sm font-medium text-gray-700"
                      >
                        Model *
                      </Label>
                      <Input
                        id="vehmodel"
                        name="vehmodel"
                        value={newVehicle.vehmodel}
                        onChange={handleInputChange}
                        placeholder="e.g., Corolla"
                        className="focus:ring-red-500"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehplate"
                        className="text-sm font-medium text-gray-700"
                      >
                        Plate Number *
                      </Label>
                      <Input
                        id="vehplate"
                        name="vehplate"
                        value={newVehicle.vehplate}
                        onChange={handleInputChange}
                        placeholder="e.g., ABC-1234"
                        className="focus:ring-red-500 font-mono"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehmileage"
                        className="text-sm font-medium text-gray-700"
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
                        className="focus:ring-red-500"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Vehicle"
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
            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
            <p className="text-gray-500 font-medium text-sm">
              Loading garage records...
            </p>
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && vehicles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="group border border-gray-200 hover:border-red-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
                        Vehicle
                      </p>
                      <CardTitle className="text-lg font-bold">
                        {vehicle.vehbrand} {vehicle.vehmodel}
                      </CardTitle>
                      <p className="text-xs font-mono font-medium text-gray-500 mt-1">
                        {vehicle.vehplate}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(vehicle)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Remove vehicle"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Brand</p>
                      <p className="font-semibold text-gray-900">
                        {vehicle.vehbrand}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="font-semibold text-gray-900">
                        {vehicle.vehmodel}
                      </p>
                    </div>
                    {vehicle.vehmileage != null && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Mileage</p>
                        <p className="font-semibold text-gray-900">
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md shadow-xl">
              <CardHeader className="text-center pb-2">
                <AlertCircle size={40} className="text-red-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-bold">
                  Remove Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <p className="text-gray-600 text-center text-sm">
                  Are you sure you want to remove this vehicle from your
                  records? This action cannot be undone.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-bold text-gray-900">
                    {vehicleToDelete.vehbrand} {vehicleToDelete.vehmodel}
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    {vehicleToDelete.vehplate}
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={handleDeleteCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirm Removal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <Card className="border-2 border-dashed border-gray-200 bg-white">
            <CardContent className="text-center py-16 space-y-6">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Car size={32} className="text-gray-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">
                  No Vehicles Found
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm">
                  Add your first vehicle to start booking services.
                </p>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus size={18} className="mr-2" />
                Add Vehicle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VehiclesPage;
