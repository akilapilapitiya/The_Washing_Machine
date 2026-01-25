import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import * as catalogService from "@/services/vehicleCatalog.service";

const ManageVehicleCatalogPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [newItem, setNewItem] = useState({
    brand: "",
    model: "",
  });

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const output = await catalogService.getCatalog();
      // Ensure we are setting an array (response format might wrap it in data property)
      setCatalog(output.data || output || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
      setError("Failed to load vehicle catalog.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.brand || !newItem.model) return;

    try {
      setSubmitting(true);
      setError(null);
      await catalogService.addToCatalog(newItem);

      setSuccess("Added successfully");
      setNewItem({ brand: "", model: "" });
      fetchCatalog();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item");
    } finally {
      setSubmitting(false);
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

  // Group by Brand
  const groupedCatalog = catalog.reduce((acc, item) => {
    if (!acc[item.brand]) acc[item.brand] = [];
    acc[item.brand].push(item);
    return acc;
  }, {});

  const sortedBrands = Object.keys(groupedCatalog).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            System Administration
          </p>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="text-gray-900" />
            Vehicle Catalog
          </h1>
          <p className="text-gray-600">
            Manage the standardized list of vehicle brands and models available
            to customers.
          </p>
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={18} />
                  Add New Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand Name</Label>
                    <Input
                      id="brand"
                      value={newItem.brand}
                      onChange={(e) =>
                        setNewItem({ ...newItem, brand: e.target.value })
                      }
                      placeholder="e.g. Toyota"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model Name</Label>
                    <Input
                      id="model"
                      value={newItem.model}
                      onChange={(e) =>
                        setNewItem({ ...newItem, model: e.target.value })
                      }
                      placeholder="e.g. Corolla"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Add to Catalog"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : (
              sortedBrands.map((brand) => (
                <Card key={brand}>
                  <CardHeader className="bg-gray-50 border-b py-3">
                    <CardTitle className="text-base font-bold text-gray-800">
                      {brand}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {groupedCatalog[brand].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-700">
                            {item.model}
                          </span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-gray-400 hover:text-red-600 p-2"
                            title="Remove model"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {!loading && sortedBrands.length === 0 && (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                Catalog is empty. Add items to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageVehicleCatalogPage;
