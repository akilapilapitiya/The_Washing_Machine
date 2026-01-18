import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Plus, Trash2, X, Loader2, AlertCircle } from "lucide-react";
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
    vehid: "",
  });

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleService.getVehicles();
      setVehicles(response.data.vehicles || []);
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
        vehid: newVehicle.vehid,
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
        vehid: "",
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
      await vehicleService.deleteVehicle(vehicleToDelete.vehid);
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
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Vehicles
            </p>
            <h1 className="text-3xl font-bold">Manage your vehicles</h1>
            <p className="text-gray-600">
              Add, view, and manage all your vehicles in one place.
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Plus size={18} />
            Add Vehicle
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Add Vehicle Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Add New Vehicle</CardTitle>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddVehicle} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="vehbrand">Brand *</Label>
                      <Input
                        id="vehbrand"
                        name="vehbrand"
                        value={newVehicle.vehbrand}
                        onChange={handleInputChange}
                        placeholder="e.g., Toyota"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehmodel">Model *</Label>
                      <Input
                        id="vehmodel"
                        name="vehmodel"
                        value={newVehicle.vehmodel}
                        onChange={handleInputChange}
                        placeholder="e.g., Corolla"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehid">Number Plate *</Label>
                      <Input
                        id="vehid"
                        name="vehid"
                        value={newVehicle.vehid}
                        onChange={handleInputChange}
                        placeholder="e.g., ABC-123"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehmileage">Mileage (km)</Label>
                      <Input
                        id="vehmileage"
                        name="vehmileage"
                        type="number"
                        value={newVehicle.vehmileage}
                        onChange={handleInputChange}
                        placeholder="e.g., 45000"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
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
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading vehicles...</p>
            </div>
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && vehicles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.vehid} className="relative overflow-hidden">
                <button
                  onClick={() => handleDeleteClick(vehicle)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition z-10"
                  title="Delete vehicle"
                >
                  <Trash2 size={16} />
                </button>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                      <Car size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {vehicle.vehbrand} {vehicle.vehmodel}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{vehicle.vehid}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Brand</p>
                      <p className="font-medium text-gray-800">
                        {vehicle.vehbrand}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Model</p>
                      <p className="font-medium text-gray-800">
                        {vehicle.vehmodel}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Plate</p>
                      <p className="font-medium text-gray-800">
                        {vehicle.vehid}
                      </p>
                    </div>
                    {vehicle.vehmileage != null && (
                      <div>
                        <p className="text-gray-500">Mileage</p>
                        <p className="font-medium text-gray-800">
                          {vehicle.vehmileage.toLocaleString()} km
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={24} />
                  Confirm Delete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete this vehicle?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-gray-900">
                    {vehicleToDelete.vehbrand} {vehicleToDelete.vehmodel}
                  </p>
                  <p className="text-sm text-gray-600">
                    Plate: {vehicleToDelete.vehid}
                  </p>
                </div>
                <p className="text-sm text-red-600">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDeleteCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Vehicle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Car size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vehicles yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first vehicle to get started with bookings.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
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