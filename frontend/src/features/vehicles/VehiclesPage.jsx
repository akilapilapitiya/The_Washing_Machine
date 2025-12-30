import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([
    {
      id: "1",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      mileage: "45,000",
      plate: "ABC-123",
      color: "Blue",
      nickname: "Daily",
    },
    {
      id: "2",
      brand: "Honda",
      model: "Civic",
      year: 2019,
      mileage: "62,000",
      plate: "XYZ-789",
      color: "White",
      nickname: "Workhorse",
    },
    {
      id: "3",
      brand: "Ford",
      model: "F-150",
      year: 2022,
      mileage: "28,000",
      plate: "TRK-555",
      color: "Gray",
      nickname: "Hauler",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    plate: "",
    color: "",
    nickname: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    const vehicle = {
      id: Date.now().toString(),
      ...newVehicle,
    };
    setVehicles((prev) => [...prev, vehicle]);
    setNewVehicle({
      brand: "",
      model: "",
      year: "",
      mileage: "",
      plate: "",
      color: "",
      nickname: "",
    });
    setShowAddForm(false);
  };

  const handleDeleteVehicle = (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    }
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
          >
            <Plus size={18} />
            Add Vehicle
          </Button>
        </div>

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
                      <Label htmlFor="brand">Brand *</Label>
                      <Input
                        id="brand"
                        name="brand"
                        value={newVehicle.brand}
                        onChange={handleInputChange}
                        placeholder="e.g., Toyota"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        name="model"
                        value={newVehicle.model}
                        onChange={handleInputChange}
                        placeholder="e.g., Corolla"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        name="year"
                        type="number"
                        value={newVehicle.year}
                        onChange={handleInputChange}
                        placeholder="e.g., 2020"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plate">Number Plate *</Label>
                      <Input
                        id="plate"
                        name="plate"
                        value={newVehicle.plate}
                        onChange={handleInputChange}
                        placeholder="e.g., ABC-123"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Mileage (km)</Label>
                      <Input
                        id="mileage"
                        name="mileage"
                        value={newVehicle.mileage}
                        onChange={handleInputChange}
                        placeholder="e.g., 45,000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        name="color"
                        value={newVehicle.color}
                        onChange={handleInputChange}
                        placeholder="e.g., Blue"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nickname">Nickname (Optional)</Label>
                      <Input
                        id="nickname"
                        name="nickname"
                        value={newVehicle.nickname}
                        onChange={handleInputChange}
                        placeholder="e.g., Daily Driver"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Vehicle</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vehicles Grid */}
        {vehicles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="relative overflow-hidden">
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id)}
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
                        {vehicle.nickname ||
                          `${vehicle.brand} ${vehicle.model}`}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{vehicle.plate}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Brand</p>
                      <p className="font-medium text-gray-800">
                        {vehicle.brand}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Model</p>
                      <p className="font-medium text-gray-800">
                        {vehicle.model}
                      </p>
                    </div>
                    {vehicle.year && (
                      <div>
                        <p className="text-gray-500">Year</p>
                        <p className="font-medium text-gray-800">
                          {vehicle.year}
                        </p>
                      </div>
                    )}
                    {vehicle.mileage && (
                      <div>
                        <p className="text-gray-500">Mileage</p>
                        <p className="font-medium text-gray-800">
                          {vehicle.mileage} km
                        </p>
                      </div>
                    )}
                    {vehicle.color && (
                      <div>
                        <p className="text-gray-500">Color</p>
                        <p className="font-medium text-gray-800">
                          {vehicle.color}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
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
