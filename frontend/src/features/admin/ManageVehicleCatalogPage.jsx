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
import * as catalogService from "@/services/vehicleCatalog.service";

const ManageVehicleCatalogPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Creation state
  const [newBrandName, setNewBrandName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [newModelName, setNewModelName] = useState("");

  const [submittingBrand, setSubmittingBrand] = useState(false);
  const [submittingModel, setSubmittingModel] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const output = await catalogService.getCatalog();
      setCatalog(output.data || output || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
      setError("Failed to load vehicle catalog.");
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
      await catalogService.addToCatalog({ brand: newBrandName, model: "" });
      setSuccess(`Brand "${newBrandName}" added.`);
      setNewBrandName("");
      fetchCatalog();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add brand");
    } finally {
      setSubmittingBrand(false);
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!selectedBrand || !newModelName.trim()) return;

    try {
      setSubmittingModel(true);
      await catalogService.addToCatalog({
        brand: selectedBrand,
        model: newModelName,
      });
      setSuccess(`Model "${newModelName}" added to ${selectedBrand}.`);
      setNewModelName("");
      fetchCatalog();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add model");
    } finally {
      setSubmittingModel(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this model?")) return;
    try {
      await catalogService.removeFromCatalog(id);
      fetchCatalog();
    } catch (err) {
      setError("Failed to delete item");
    }
  };

  const groupedCatalog = catalog.reduce((acc, item) => {
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
                {catalog.filter((i) => i.model).length}
              </span>{" "}
              Models
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}

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
                              onClick={() => handleDelete(item.id)}
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
    </div>
  );
};

export default ManageVehicleCatalogPage;
