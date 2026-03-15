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
  CheckCircle2,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as vehicleService from "@/services/vehicle.service";
import * as catalogService from "@/services/vehicleCatalog.service";
import { toast } from "sonner";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import PageToolbar from "@/components/common/PageToolbar";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [newVehicle, setNewVehicle] = useState({
    vehbrand: "",
    vehmodel: "",
    vehmileage: "",
    vehplate: "",
    fuel_type: "",
    vehcolor: "",
    manufacture_year: "",
    transmission: "",
    engine_capacity: "",
  });

  // Plate State
  const [plateType, setPlateType] = useState("modern"); // 'modern' | 'vintage'
  const [platePart1, setPlatePart1] = useState("");
  const [platePart2, setPlatePart2] = useState("");

  // "Other" mode flags
  const [isManualBrand, setIsManualBrand] = useState(false);
  const [isManualModel, setIsManualModel] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        const [vehRes, catRes] = await Promise.all([
          vehicleService.getVehicles(),
          catalogService.getCatalog().catch(() => ({ data: [] })),
        ]);

        setVehicles(vehRes || []);
        setCatalog(catRes.data || catRes || []);
      } catch (err) {
        console.error("Failed to load data:", err);
        toast.error("Failed to load garage data", {
          description: "Please refresh the page",
        });
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Memoize action button for stable reference in useSetPageHeader
  const headerAction = React.useMemo(() => (
    <Button
      onClick={() => setShowAddForm(true)}
      className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm"
      disabled={loading}
    >
      <Plus size={16} className="mr-2" />
      Add Vehicle
    </Button>
  ), [loading]);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      !query ||
      [
        vehicle.vehbrand,
        vehicle.vehmodel,
        vehicle.vehplate,
        vehicle.vehcolor,
      ].some((value) => String(value || "").toLowerCase().includes(query))
    );
  });

  const toolbar = React.useMemo(
    () => (
      <PageToolbar
        stats={[
          { icon: Car, label: "Total", value: vehicles.length, iconClassName: "text-blue-500" },
          { icon: Gauge, label: "Service Due", value: vehicles.filter((v) => v.next_service_mileage && v.next_service_mileage > 0).length, iconClassName: "text-red-500" },
        ]}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by brand, model, plate, or color..."
      />
    ),
    [vehicles, searchQuery],
  );

  useSetPageHeader(
    "Garage",
    "Manage your vehicles",
    "Add, view, and manage all your vehicles in one place.",
    headerAction,
    toolbar,
  );

  // Derived state for dropdowns
  const availableBrands = [
    ...new Set(catalog.map((item) => item.brand)),
  ].sort();
  const availableModels = catalog
    .filter((item) => item.brand === newVehicle.vehbrand)
    .map((item) => item.model)
    .sort();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandChange = (e) => {
    const value = e.target.value;
    if (value === "OTHER_MANUAL") {
      setIsManualBrand(true);
      setNewVehicle((prev) => ({ ...prev, vehbrand: "", vehmodel: "" }));
      setIsManualModel(true);
    } else {
      setIsManualBrand(false);
      setIsManualModel(false);
      setNewVehicle((prev) => ({ ...prev, vehbrand: value, vehmodel: "" }));
    }
  };

  const handleModelChange = (e) => {
    const value = e.target.value;
    if (value === "OTHER_MANUAL") {
      setIsManualModel(true);
      setNewVehicle((prev) => ({ ...prev, vehmodel: "" }));
    } else {
      setIsManualModel(false);
      setNewVehicle((prev) => ({ ...prev, vehmodel: value }));
    }
  };

  // Plate Handlers
  const handlePlatePart1Change = (e) => {
    const val = e.target.value.toUpperCase();
    if (plateType === "modern") {
      // Letters only, max 3
      if (/^[A-Z]{0,3}$/.test(val)) setPlatePart1(val);
    } else {
      // Numbers only, 0-1000
      if (/^\d{0,4}$/.test(val)) {
        // Allow if empty or valid number <= 1000
        if (val === "" || parseInt(val) <= 1000) setPlatePart1(val);
      }
    }
  };

  const handlePlatePart2Change = (e) => {
    const val = e.target.value;
    // Numbers only, max 4
    if (/^\d{0,4}$/.test(val)) setPlatePart2(val);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();

    // Plate Validation
    if (plateType === "modern") {
      if (platePart1.length < 2) {
        toast.error("Invalid plate format", {
          description: "Modern plates need at least 2 letters (e.g., WP, CAB)",
        });
        return;
      }
    } else {
      if (platePart1 === "") {
        toast.error("Invalid plate format", {
          description: "Please enter the numeric prefix",
        });
        return;
      }
    }

    if (platePart2.length !== 4) {
      toast.error("Invalid plate format", {
        description: "The second part must be exactly 4 digits",
      });
      return;
    }

    // Mileage Validation
    const mileageValue = parseInt(newVehicle.vehmileage) || 0;
    if (mileageValue < 0) {
      toast.error("Invalid mileage", {
        description: "Mileage cannot be negative",
      });
      return;
    }

    const finalPlate = `${platePart1}-${platePart2}`;

    try {
      setSubmitting(true);

      const vehicleData = {
        vehplate: finalPlate,
        vehmileage: parseInt(newVehicle.vehmileage) || 0,
        vehbrand: newVehicle.vehbrand,
        vehmodel: newVehicle.vehmodel,
        fuel_type: newVehicle.fuel_type,
        vehcolor: newVehicle.vehcolor,
        manufacture_year: parseInt(newVehicle.manufacture_year) || null,
        transmission: newVehicle.transmission,
        engine_capacity: parseInt(newVehicle.engine_capacity) || null,
      };

      await vehicleService.createVehicle(vehicleData);

      // Refresh list
      const updatedList = await vehicleService.getVehicles();
      setVehicles(updatedList || []);

      // Success toast
      toast.success("Vehicle added to your garage!", {
        description: `${vehicleData.vehbrand} ${vehicleData.vehmodel} (${finalPlate})`,
      });

      // Reset form
      setNewVehicle({
        vehbrand: "",
        vehmodel: "",
        vehmileage: "",
        vehplate: "",
        fuel_type: "",
        vehcolor: "",
        manufacture_year: "",
        transmission: "",
        engine_capacity: "",
      });
      setPlatePart1("");
      setPlatePart2("");
      setIsManualBrand(false);
      setIsManualModel(false);
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create vehicle:", err);

      // Parse validation errors from backend
      let errorMessage = "Failed to add vehicle";
      let errorDescription = "Please try again";

      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        // Joi validation errors
        const firstError = err.response.data.errors[0];
        errorMessage = firstError.field
          ? `Invalid ${firstError.field}`
          : "Validation error";
        errorDescription = firstError.message || "Please check your input";
      } else if (err.response?.data?.message) {
        errorDescription = err.response.data.message;
      } else if (err.message) {
        errorDescription = err.message;
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });
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
      await vehicleService.deleteVehicle(vehicleToDelete.id);
      const updatedList = await vehicleService.getVehicles();
      setVehicles(updatedList || []);

      toast.success("Vehicle removed from garage", {
        description: `${vehicleToDelete.vehbrand} ${vehicleToDelete.vehmodel}`,
      });

      setShowDeleteConfirm(false);
      setVehicleToDelete(null);
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      toast.error("Failed to remove vehicle", {
        description: err.message || "Please try again",
      });
      setShowDeleteConfirm(false);
      setVehicleToDelete(null);
    }
  };

  return (
          <div className="mx-auto w-full max-w-7xl space-y-6">

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
                    {/* Brand Selection */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehbrand"
                        className="text-sm font-medium text-gray-700"
                      >
                        Brand Name *
                      </Label>
                      {!isManualBrand ? (
                        <select
                          id="vehbrand"
                          className="w-full h-10 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                          value={newVehicle.vehbrand}
                          onChange={handleBrandChange}
                          required
                          disabled={submitting}
                        >
                          <option value="">Select Brand</option>
                          {availableBrands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                          <option
                            value="OTHER_MANUAL"
                            className="font-bold text-red-600"
                          >
                            + Other / Not Listed
                          </option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            name="vehbrand"
                            value={newVehicle.vehbrand}
                            onChange={handleInputChange}
                            placeholder="Enter custom brand"
                            className="focus:ring-red-500"
                            required
                            disabled={submitting}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsManualBrand(false);
                              setNewVehicle((prev) => ({
                                ...prev,
                                vehbrand: "",
                              }));
                            }}
                            title="Back to list"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="vehmodel"
                        className="text-sm font-medium text-gray-700"
                      >
                        Model *
                      </Label>
                      {!isManualModel && !isManualBrand ? (
                        <select
                          id="vehmodel"
                          className="w-full h-10 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                          value={newVehicle.vehmodel}
                          onChange={handleModelChange}
                          required
                          disabled={submitting || !newVehicle.vehbrand}
                        >
                          <option value="">Select Model</option>
                          {availableModels.map((model) => (
                            <option key={model} value={model}>
                              {model}
                            </option>
                          ))}
                          <option
                            value="OTHER_MANUAL"
                            className="font-bold text-red-600"
                          >
                            + Other / Not Listed
                          </option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            name="vehmodel"
                            value={newVehicle.vehmodel}
                            onChange={handleInputChange}
                            placeholder="Enter custom model"
                            className="focus:ring-red-500"
                            required
                            disabled={submitting}
                          />
                          {!isManualBrand && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsManualModel(false);
                                setNewVehicle((prev) => ({
                                  ...prev,
                                  vehmodel: "",
                                }));
                              }}
                              title="Back to list"
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SRI LANKAN PLATE LOGIC */}
                    <div className="md:col-span-2 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-gray-800">
                          Plate Number *
                        </Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="plateType"
                              value="modern"
                              checked={plateType === "modern"}
                              onChange={() => {
                                setPlateType("modern");
                                setPlatePart1("");
                              }}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm font-medium text-gray-600">
                              Modern (Letters)
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="plateType"
                              value="vintage"
                              checked={plateType === "vintage"}
                              onChange={() => {
                                setPlateType("vintage");
                                setPlatePart1("");
                              }}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm font-medium text-gray-600">
                              Numeric (19-xxxx)
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            value={platePart1}
                            onChange={handlePlatePart1Change}
                            placeholder={plateType === "modern" ? "CAB" : "19"}
                            className="text-center font-mono uppercase text-lg tracking-wider focus:ring-red-500"
                            maxLength={plateType === "modern" ? 3 : 4}
                          />
                          <p className="text-[10px] text-gray-500 mt-1 text-center">
                            {plateType === "modern"
                              ? "2-3 Letters (e.g. WP, CAB)"
                              : "Number 0-1000"}
                          </p>
                        </div>
                        <div className="text-xl font-bold text-gray-400">-</div>
                        <div className="flex-[2]">
                          <Input
                            value={platePart2}
                            onChange={handlePlatePart2Change}
                            placeholder="1234"
                            className="text-center font-mono text-lg tracking-[0.2em] focus:ring-red-500"
                            maxLength={4}
                          />
                          <p className="text-[10px] text-gray-500 mt-1 text-center">
                            Exactly 4 Digits
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="vehmileage"
                        className="text-sm font-medium text-gray-700"
                      >
                        Mileage (KM) *
                      </Label>
                      <Input
                        id="vehmileage"
                        name="vehmileage"
                        type="number"
                        min="0"
                        value={newVehicle.vehmileage}
                        onChange={handleInputChange}
                        placeholder="e.g., 45000"
                        className="focus:ring-red-500"
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="fuel_type"
                        className="text-sm font-medium text-gray-700"
                      >
                        Fuel Type *
                      </Label>
                      <select
                        id="fuel_type"
                        name="fuel_type"
                        className="w-full h-10 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                        value={newVehicle.fuel_type}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      >
                        <option value="">Select Fuel Type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="vehcolor"
                        className="text-sm font-medium text-gray-700"
                      >
                        Vehicle Color
                      </Label>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-md border border-gray-200 cursor-pointer shadow-sm transition-transform hover:scale-105"
                          style={{
                            backgroundColor: newVehicle.vehcolor || "#ffffff",
                          }}
                          onClick={() =>
                            document.getElementById("color-picker").click()
                          }
                        />
                        <Input
                          id="vehcolor"
                          name="vehcolor"
                          value={newVehicle.vehcolor}
                          onChange={handleInputChange}
                          placeholder="#000000"
                          className="flex-1 focus:ring-red-500 font-mono"
                          disabled={submitting}
                        />
                        <input
                          id="color-picker"
                          type="color"
                          className="sr-only"
                          value={newVehicle.vehcolor || "#ffffff"}
                          onChange={(e) => {
                            setNewVehicle((prev) => ({
                              ...prev,
                              vehcolor: e.target.value,
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="manufacture_year"
                        className="text-sm font-medium text-gray-700"
                      >
                        Year of Manufacture
                      </Label>
                      <Input
                        id="manufacture_year"
                        name="manufacture_year"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={newVehicle.manufacture_year}
                        onChange={handleInputChange}
                        placeholder="e.g., 2018"
                        className="focus:ring-red-500"
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="transmission"
                        className="text-sm font-medium text-gray-700"
                      >
                        Transmission
                      </Label>
                      <select
                        id="transmission"
                        name="transmission"
                        className="w-full h-10 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                        value={newVehicle.transmission}
                        onChange={handleInputChange}
                        disabled={submitting}
                      >
                        <option value="">Select Transmission</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="engine_capacity"
                        className="text-sm font-medium text-gray-700"
                      >
                        Engine Capacity (CC)
                      </Label>
                      <Input
                        id="engine_capacity"
                        name="engine_capacity"
                        type="number"
                        min="0"
                        value={newVehicle.engine_capacity}
                        onChange={handleInputChange}
                        placeholder="e.g., 1500"
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

        {/* Vehicles Table */}
        {!loading && (
          <DataTable
            columns={[
              {
                key: "vehplate",
                label: "Registration",
                render: (v) => (
                  <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {v.vehplate}
                  </span>
                ),
              },
              {
                key: "vehbrand",
                label: "Vehicle",
                render: (v) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 leading-tight">{v.vehbrand}</span>
                    <span className="text-xs text-gray-500">{v.vehmodel}</span>
                  </div>
                ),
              },
              {
                key: "specs",
                label: "Specs",
                render: (v) => (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-600 uppercase">
                      {v.manufacture_year || "N/A"} • {v.fuel_type || "N/A"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {v.transmission || "N/A"} • {v.engine_capacity ? `${v.engine_capacity}CC` : "N/A"}
                    </span>
                  </div>
                ),
              },
              {
                key: "vehmileage",
                label: "Mileage",
                render: (v) => (
                  <span className="text-sm font-semibold text-gray-700">
                    {v.vehmileage?.toLocaleString()} KM
                  </span>
                ),
              },
              {
                key: "vehcolor",
                label: "Color",
                render: (v) => (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: v.vehcolor || "#fff" }}
                    />
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {v.vehcolor || "N/A"}
                    </span>
                  </div>
                ),
              },
              {
                key: "next_service_mileage",
                label: "Next Service",
                render: (v) => (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      v.next_service_mileage === 0 || !v.next_service_mileage
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-red-50 text-red-600 border-red-100",
                    )}
                  >
                    {v.next_service_mileage === 0 || !v.next_service_mileage
                      ? "Pending Check"
                      : `${v.next_service_mileage.toLocaleString()} KM`}
                  </span>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                headerClassName: "text-right",
                className: "text-right",
                render: (v) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(v)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                ),
              },
            ]}
            data={filteredVehicles}
            keyField="id"
            emptyIcon={Car}
            emptyTitle="No Vehicles Found"
            emptySubtitle="Add your first vehicle to start booking services."
            emptyAction={
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus size={18} className="mr-2" />
                Add Vehicle
              </Button>
            }
          />
        )}

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
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
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


      </div>
    
  );
};

export default VehiclesPage;
