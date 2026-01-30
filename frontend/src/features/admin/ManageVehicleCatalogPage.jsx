import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Database,
  CheckCircle,
  Car,
  Layers,
  ArrowRight,
} from "lucide-react";
import * as vehicleCatalogService from "@/services/vehicleCatalog.service";
import { COLORS } from "@/lib/colors";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

const ManageVehicleCatalogPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newModel, setNewModel] = useState({ brand: "", model: "" });
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();
  // Creation state
  const [newBrandName, setNewBrandName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [newModelName, setNewModelName] = useState("");

  const [submittingBrand, setSubmittingBrand] = useState(false);
  const [submittingModel, setSubmittingModel] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const output = await vehicleCatalogService.getVehicleModels();
      setModels(output.data || output || []);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
      toast.error("Failed to load vehicle catalog", {
        description: "Please refresh the page",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    try {
      setSubmittingBrand(true);
      // Create with empty model to establish the brand
      await vehicleCatalogService.addVehicleModel({
        brand: newBrandName,
        model: "",
      });

      toast.success(`Brand "${newBrandName}" added to catalog`);

      setNewBrandName("");
      fetchModels();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add brand", {
        description: err.response?.data?.message || "Please try again",
      });
    } finally {
      setSubmittingBrand(false);
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!selectedBrand || !newModelName.trim()) return;

    try {
      setSubmittingModel(true);
      await vehicleCatalogService.addVehicleModel({
        brand: selectedBrand,
        model: newModelName,
      });

      toast.success(`Model "${newModelName}" added`, {
        description: `Added to ${selectedBrand} lineup`,
      });

      setNewModelName("");
      fetchModels();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add model", {
        description: err.response?.data?.message || "Please try again",
      });
    } finally {
      setSubmittingModel(false);
    }
  };

  const handleRemoveModel = async (catalogid) => {
    const confirmed = await confirm({
      variant: "destructive",
      title: "Remove Vehicle Model?",
      description: "Are you sure you want to remove this model?",
      confirmText: "Remove",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await vehicleCatalogService.deleteVehicleModel(catalogid);
      toast.success("Vehicle model removed successfully!");
      fetchModels();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete model", {
        description: "Please try again",
      });
    }
  };

  const groupedCatalog = models.reduce((acc, item) => {
    if (!acc[item.brand]) acc[item.brand] = [];
    acc[item.brand].push(item);
    return acc;
  }, {});

  const sortedBrands = Object.keys(groupedCatalog).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
              System Administration
            </p>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="text-gray-900" />
              Vehicle Catalog
            </h1>
            <p className="text-gray-600">Manage standardized vehicle data.</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Layers size={16} />
              <span className="font-bold text-gray-900">
                {sortedBrands.length}
              </span>{" "}
              Brands
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <Car size={16} />
              <span className="font-bold text-gray-900">
                {models.filter((i) => i.model).length}
              </span>{" "}
              Models
            </div>
          </div>
        </div>

        {/* Action Blocks (The 2 Blocks) */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Step 1: Add Brand */}
          <Card className="border-l-4 border-l-gray-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                Add New Brand
              </CardTitle>
              <CardDescription>
                Start by registering a vehicle manufacturer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBrand} className="flex gap-3">
                <Input
                  placeholder="Brand Name (e.g. BMW)"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800"
                  disabled={submittingBrand}
                >
                  {submittingBrand ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Step 2: Add Model */}
          <Card className="border-l-4 border-l-red-600 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                Add Model
              </CardTitle>
              <CardDescription>
                Select a brand and add specific models.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAddModel}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="w-full sm:w-1/3">
                  <select
                    className="w-full h-10 px-3 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    <option value="">Select Brand</option>
                    {sortedBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Model (e.g. X5)"
                  className="flex-1"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                />
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={submittingModel}
                >
                  {submittingModel ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "Add"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Catalog Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              Vehicle Inventory
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-red-600 h-10 w-10" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedBrands.map((brand) => (
                <Card
                  key={brand}
                  className="group hover:shadow-md transition-shadow"
                >
                  <CardHeader className="bg-gray-50 border-b py-3 px-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-bold">
                      {brand}
                    </CardTitle>
                    <span className="text-xs bg-white border px-2 py-0.5 rounded-full text-gray-500">
                      {groupedCatalog[brand].filter((i) => i.model).length}
                    </span>
                  </CardHeader>
                  <CardContent className="p-0 max-h-[200px] overflow-y-auto custom-scrollbar">
                    <div className="divide-y">
                      {groupedCatalog[brand]
                        .filter((item) => item.model)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 text-sm hover:bg-gray-50"
                          >
                            <span className="text-gray-700 font-medium">
                              {item.model}
                            </span>
                            <button
                              onClick={() => handleRemoveModel(item.id)}
                              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default ManageVehicleCatalogPage;
