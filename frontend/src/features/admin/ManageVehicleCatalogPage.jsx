import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  X,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as vehicleCatalogService from "@/services/vehicleCatalog.service";
import { COLORS } from "@/lib/colors";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";

const ManageVehicleCatalogPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();
  
  // Modal states
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [showViewModelsModal, setShowViewModelsModal] = useState(false);
  
  // Selection states
  const [selectedBrand, setSelectedBrand] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [viewingBrand, setViewingBrand] = useState(null);

  const [submittingBrand, setSubmittingBrand] = useState(false);
  const [submittingModel, setSubmittingModel] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const output = await vehicleCatalogService.getVehicleModels();
      setModels(Array.isArray(output) ? output : []);
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
      setShowAddBrandModal(false);
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
      setShowAddModelModal(false);
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

  // Define columns for Brands Table
  const columns = [
    {
      key: "brand",
      label: "Brand Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold border border-red-100">
            {row.brand.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-gray-900">{row.brand}</span>
        </div>
      ),
    },
    {
      key: "models_count",
      label: "Models Registered",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Car size={16} className="text-gray-400" />
          <span className="font-medium text-gray-700">
            {row.models.filter((m) => m.model).length}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setViewingBrand(row);
              setShowViewModelsModal(true);
            }}
            className="hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Settings size={14} className="mr-2" />
            Manage Models
          </Button>
        </div>
      ),
    },
  ];

  const brandData = sortedBrands.map((brand) => ({
    brand,
    models: groupedCatalog[brand],
  }));

  // Memoize action element for stable reference
  const headerAction = React.useMemo(() => (
    <div className="flex items-center gap-3">
      <Button
        onClick={() => setShowAddBrandModal(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Plus size={18} />
        Add Brand
      </Button>
      <Button
        onClick={() => setShowAddModelModal(true)}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
      >
        <Plus size={18} />
        Add Model
      </Button>
    </div>
  ), []);

  const toolbar = React.useMemo(() => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border shadow-sm text-xs font-bold text-gray-700">
        <Layers size={14} className="text-red-600" />
        {sortedBrands.length} Brands
      </div>
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border shadow-sm text-xs font-bold text-gray-700">
        <Car size={14} className="text-red-600" />
        {models.filter((i) => i.model).length} Models Registered
      </div>
    </div>
  ), [sortedBrands.length, models]);

  useSetPageHeader(
    "System Administration",
    "Vehicle Catalog",
    "Manage standardized vehicle data for customers to select from.",
    headerAction,
    toolbar,
  );

  if (loading) return <PageLoader message="Loading vehicle catalog..." />;

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={brandData}
        keyField="brand"
        searchPlaceholder="Search brands..."
        emptyIcon={Car}
        emptyTitle="No brands found"
        emptySubtitle="Start by adding a vehicle brand to the catalog."
      />

      {/* Add Brand Modal */}
      {showAddBrandModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 bg-white/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <Plus size={22} />
                  </div>
                  Add New Brand
                </CardTitle>
                <button
                  onClick={() => setShowAddBrandModal(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <CardDescription className="mt-1.5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Register a vehicle manufacturer in the system catalog.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddBrand}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandName" className="text-sm font-semibold text-gray-700">Brand Name</Label>
                    <Input
                      id="brandName"
                      placeholder="e.g. BMW, Toyota, Tesla"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="h-11 border-gray-200 focus:ring-red-600"
                      autoFocus
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddBrandModal(false)}
                  className="h-11 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 h-11 px-6 text-white"
                  disabled={submittingBrand || !newBrandName.trim()}
                >
                  {submittingBrand ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : (
                    <Plus className="mr-2" size={16} />
                  )}
                  Register Brand
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Model Modal */}
      {showAddModelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 bg-white/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <Plus size={22} />
                  </div>
                  Add New Model
                </CardTitle>
                <button
                  onClick={() => setShowAddModelModal(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <CardDescription className="mt-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Add a specific vehicle model to an existing brand.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddModel}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Select Brand</Label>
                    <select
                      className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                      <option value="">Select a brand</option>
                      {sortedBrands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelName" className="text-sm font-semibold text-gray-700">Model Name</Label>
                    <Input
                      id="modelName"
                      placeholder="e.g. X5, Corolla, Model 3"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      className="h-11 border-gray-200 focus:ring-red-600"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModelModal(false)}
                  className="h-11 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 h-11 px-6 text-white"
                  disabled={submittingModel || !selectedBrand || !newModelName.trim()}
                >
                  {submittingModel ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : (
                    "Add Model"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* View Models Modal */}
      {showViewModelsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl shadow-2xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 bg-white/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <Car size={22} />
                  </div>
                  {viewingBrand?.brand} Models
                </CardTitle>
                <button
                  onClick={() => setShowViewModelsModal(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <CardDescription className="mt-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                System registered models for {viewingBrand?.brand}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                <DataTable
                  columns={[
                    {
                      key: "model",
                      label: "Model Name",
                      render: (row) => <span className="font-semibold">{row.model}</span>,
                    },
                    {
                      key: "actions",
                      label: "Actions",
                      className: "text-right",
                      render: (row) => (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveModel(row.id)}
                          className="text-gray-400 hover:text-red-600 h-8 w-8"
                        >
                          <Trash2 size={14} />
                        </Button>
                      ),
                    },
                  ]}
                  data={viewingBrand?.models?.filter(m => m.model) || []}
                  keyField="id"
                  showSearch={false}
                  emptyTitle="No models found"
                  emptySubtitle={`No models have been registered for ${viewingBrand?.brand} yet.`}
                />
              </div>
            </CardContent>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setShowViewModelsModal(false)}
                className="w-full h-11"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default ManageVehicleCatalogPage;
