import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Edit,
  X,
  CheckCircle,
  Banknote,
  Clock,
  Loader2,
  Tag,
  Box,
  Layers,
} from "lucide-react";
import * as serviceService from "@/services/service.service";
import { PageLoader } from "@/components/common/LoadingStates";

import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { IMAGE_BASE_URL } from "@/configs/env";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import PageToolbar from "@/components/common/PageToolbar";

const ManageServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split("T")[0];
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    servicename: "",
    servicedetails: "",
    serviceprice: "",
    servicetime: "00:00",
    has_offer: false,
    offer_price: "",
    offer_description: "",
    offer_start_date: "",
    offer_end_date: "",
    servicetype: "package",
    short_description: "",
    long_description: "",
    image_url: "",
    gallery_urls: [],
    benefits: [],
    category: "",
    is_featured: false,
    is_variable_price: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getServices();
      setServices(data);
    } catch (err) {
      toast.error(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDurationChange = (field, value) => {
    const hours =
      field === "hours"
        ? value
        : parseInt(formData.servicetime?.split(":")[0] || "0");
    const minutes =
      field === "minutes"
        ? value
        : parseInt(formData.servicetime?.split(":")[1] || "0");
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    setFormData((prev) => ({ ...prev, servicetime: formattedTime }));
  };

  const getDurationParts = () => {
    const [hours, minutes] = formData.servicetime?.split(":").map(Number) || [
      0, 0,
    ];
    return { hours: hours || 0, minutes: minutes || 0 };
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const resetForm = React.useCallback(() => {
    setImageFile(null);
    setFormData({
      servicename: "",
      servicedetails: "",
      serviceprice: "",
      servicetime: "00:00",
      has_offer: false,
      offer_price: "",
      offer_description: "",
      offer_start_date: "",
      offer_end_date: "",
      servicetype: "package",
      short_description: "",
      long_description: "",
      image_url: "",
      gallery_urls: [],
      benefits: [],
      category: "",
      is_featured: false,
      is_variable_price: false,
    });
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const payload = new FormData();

      // Append standard fields
      Object.keys(formData).forEach((key) => {
        if (key === "gallery_urls" || key === "benefits") {
          payload.append(key, JSON.stringify(formData[key]));
        } else if (key === "image_url") {
          // Skip image_url string if we have a file, or send it if we don't
          if (!imageFile && formData[key]) {
            payload.append(key, formData[key]);
          }
        } else {
          payload.append(key, formData[key] === null ? "" : formData[key]);
        }
      });

      if (imageFile) {
        payload.append("image", imageFile);
      }

      await serviceService.createService(payload);
      resetForm();
      setShowAddForm(false);
      toast.success("Service added successfully!");
      toast.success("Operation completed successfully");
      await fetchServices();
    } catch (err) {
      toast.error(err.message || "Failed to add service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "gallery_urls" || key === "benefits") {
          payload.append(key, JSON.stringify(formData[key]));
        } else if (key === "image_url") {
          if (!imageFile && formData[key]) {
            payload.append(key, formData[key]);
          }
        } else {
          payload.append(key, formData[key] === null ? "" : formData[key]);
        }
      });

      if (imageFile) {
        payload.append("image", imageFile);
      }

      await serviceService.updateService(selectedService.serviceid, payload);
      resetForm();
      setShowEditForm(false);
      setSelectedService(null);
      toast.success("Service updated successfully!");
      toast.success("Operation completed successfully");
      await fetchServices();
    } catch (err) {
      toast.error(err.message || "Failed to update service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (serviceid) => {
    const confirmed = await confirm({
      variant: "destructive",
      title: "Delete Service?",
      description:
        "Are you sure you want to delete this service? This action cannot be undone.\n\nWARNING: Any linked images or assets will also be permanently removed.",
      confirmText: "Delete Service",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await serviceService.deleteService(serviceid);
      toast.success("Service deleted successfully!");
      toast.success("Operation completed successfully");
      await fetchServices();
    } catch (err) {
      toast.error(err.message || "Failed to delete service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditForm = (service) => {
    setSelectedService(service);
    // Ensure time is HH:MM (strip seconds if present)
    const timeParts = service.servicetime
      ? service.servicetime.split(":")
      : ["00", "00"];
    const formattedTime = `${timeParts[0]}:${timeParts[1] || "00"}`;

    setFormData({
      servicename: service.servicename,
      servicedetails: service.servicedetails,
      serviceprice: service.serviceprice.toString(),
      servicetime: formattedTime,
      has_offer: service.has_offer || false,
      offer_price: service.offer_price ? service.offer_price.toString() : "",
      offer_description: service.offer_description || "",
      offer_start_date: service.offer_start_date
        ? new Date(service.offer_start_date).toISOString().split("T")[0]
        : "",
      offer_end_date: service.offer_end_date
        ? new Date(service.offer_end_date).toISOString().split("T")[0]
        : "",
      servicetype: service.servicetype || "package",
      short_description: service.short_description || "",
      long_description: service.long_description || "",
      image_url: service.image_url || "",
      gallery_urls: service.gallery_urls || [],
      benefits: service.benefits || [],
      category: service.category || "",
      is_featured: service.is_featured || false,
      is_variable_price: service.is_variable_price || false,
    });
    setImageFile(null);
    setShowEditForm(true);
  };

  const openAddForm = React.useCallback(() => {
    resetForm();
    setImageFile(null);
    setShowAddForm(true);
  }, [resetForm]);

  // Memoize action button for stable reference
  const headerAction = React.useMemo(() => (
    <Button
      onClick={openAddForm}
      className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wide rounded-lg shadow-sm"
    >
      <Plus size={18} />
      Add Service
    </Button>
  ), [openAddForm]);

  const toolbar = React.useMemo(() => (
    <PageToolbar
      stats={[
        { icon: Box, label: "Total", value: services.length, iconClassName: "text-gray-500" },
        { icon: Tag, label: "Offers", value: services.filter((service) => service.has_offer).length, iconClassName: "text-red-500" },
        { icon: Layers, label: "Featured", value: services.filter((service) => service.is_featured).length, iconClassName: "text-yellow-500" },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search services..."
      searchWidthClass="sm:w-80"
    />
  ), [searchQuery, services]);

  useSetPageHeader(
    "Services",
    "Service Registry",
    "Add, edit, and manage all available services.",
    headerAction,
    toolbar,
  );

  const columns = [
    {
      key: "service",
      label: "Service Details",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {row.image_url ? (
              <img loading="lazy"
                src={`${IMAGE_BASE_URL}${row.image_url}`}
                alt={row.servicename}
                className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm">
                <Box size={20} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900">{row.servicename}</p>
              {row.is_featured && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                  FEATURED
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px] mt-0.5">
              {row.short_description || row.servicedetails}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category & Type",
      render: (row) => (
        <div className="flex flex-col items-start gap-1.5">
          {row.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase">
              {row.category}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
              row.servicetype === "package"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {row.servicetype === "package" ? (
              <>
                <Box size={10} /> PACKAGE
              </>
            ) : (
              <>
                <Layers size={10} /> ADD-ON
              </>
            )}
          </span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price & Offer",
      render: (row) => {
        if (row.has_offer) {
          return (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-red-600">
                Rs. {parseFloat(row.offer_price).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 line-through">
                Rs. {parseFloat(row.serviceprice).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded mt-1 w-max">
                <Tag size={10} /> OFFER
              </span>
            </div>
          );
        }
        return (
          <div className="flex flex-col">
            {row.is_variable_price && (
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Starts From
              </span>
            )}
            <span className="text-sm font-bold text-gray-900">
              Rs. {parseFloat(row.serviceprice).toLocaleString()}
            </span>
          </div>
        );
      },
    },
    {
      key: "duration",
      label: "Duration",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Clock size={16} className="text-gray-400" />
          {row.servicetime} hrs
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditForm(row)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Edit Service"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteService(row.serviceid)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Service"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filteredServices = services.filter((service) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        service.servicename,
        service.servicedetails,
        service.category,
        service.servicetype,
        service.short_description,
      ].some((value) => String(value || "").toLowerCase().includes(query));

    return matchesSearch;
  });

  return (
    <div>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="space-y-6">
          {loading ? (
            <PageLoader message="Loading service catalog..." />
          ) : (
            <DataTable
              columns={columns}
              data={filteredServices}
              keyField="serviceid"
              emptyIcon={Box}
              emptyTitle="No services yet"
              emptySubtitle={searchQuery ? "No services match your search." : "Add your first service package to get started."}
              emptyAction={
                <Button onClick={openAddForm} className="bg-red-600 hover:bg-red-700 mt-4">
                  <Plus size={16} className="mr-2" />
                  Add Service
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  {showAddForm ? (
                    <>
                      <div className="p-2 bg-red-50 rounded-lg">
                        <Plus size={20} className="text-red-600" />
                      </div>
                      Add Service
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <Edit size={20} className="text-gray-700" />
                      </div>
                      Edit Service
                    </>
                  )}
                </CardTitle>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                  }}
                  disabled={isSubmitting}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form
                onSubmit={showAddForm ? handleAddService : handleEditService}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="servicename"
                      className="text-sm font-medium text-gray-700"
                    >
                      Service Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="servicename"
                      name="servicename"
                      value={formData.servicename}
                      onChange={handleInputChange}
                      placeholder="e.g., Premium Exterior Wash"
                      className="h-11 border-gray-300 focus:ring-red-600"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Service Category
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${formData.servicetype === "package" ? "border-red-600 bg-red-50/50 ring-1 ring-red-600" : "border-gray-200 hover:bg-gray-50"}`}
                      >
                        <input
                          type="radio"
                          name="servicetype"
                          value="package"
                          checked={formData.servicetype === "package"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div
                          className={`p-2 rounded-md ${formData.servicetype === "package" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}
                        >
                          <Box size={18} />
                        </div>
                        <div className="text-sm">
                          <span
                            className={`font-semibold block ${formData.servicetype === "package" ? "text-red-900" : "text-gray-900"}`}
                          >
                            Package
                          </span>
                          <span className="text-xs text-gray-500">
                            Stand-alone service
                          </span>
                        </div>
                      </label>
                      <label
                        className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${formData.servicetype === "addon" ? "border-red-600 bg-red-50/50 ring-1 ring-red-600" : "border-gray-200 hover:bg-gray-50"}`}
                      >
                        <input
                          type="radio"
                          name="servicetype"
                          value="addon"
                          checked={formData.servicetype === "addon"}
                          onChange={handleInputChange}
                          className="text-red-600 focus:ring-red-500 sr-only"
                        />
                        <div
                          className={`p-2 rounded-md ${formData.servicetype === "addon" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}
                        >
                          <Layers size={18} />
                        </div>
                        <div className="text-sm">
                          <span
                            className={`font-semibold block ${formData.servicetype === "addon" ? "text-red-900" : "text-gray-900"}`}
                          >
                            Add-on
                          </span>
                          <span className="text-xs text-gray-500">
                            Extra service
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="category"
                        className="text-sm font-medium text-gray-700"
                      >
                        Category
                      </Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-300"
                      >
                        <option value="" disabled>Select a category</option>
                        <option value="Exterior">Exterior</option>
                        <option value="Interior">Interior</option>
                        <option value="Exterior and Interior">Exterior and Interior</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="image_url"
                        className="text-sm font-medium text-gray-700"
                      >
                        Primary Image
                      </Label>
                      <Input
                        id="image_url"
                        name="image_url"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="h-11 border-gray-300 pt-1.5"
                      />
                      {formData.image_url && !imageFile && (
                        <p className="text-xs text-green-600 truncate">
                          Current: {formData.image_url.split("/").pop()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="short_description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Short Description <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="short_description"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      placeholder="Brief summary for service cards..."
                      className="h-11 border-gray-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="long_description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Long Description
                    </Label>
                    <textarea
                      id="long_description"
                      name="long_description"
                      value={formData.long_description}
                      onChange={handleInputChange}
                      placeholder="Detailed breakdown of the service process..."
                      rows={4}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none text-sm transition-shadow"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5 pt-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="serviceprice"
                        className="text-sm font-medium text-gray-700"
                      >
                        Base Price (Rs.) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium sm:text-sm">
                          Rs.
                        </span>
                        <Input
                          id="serviceprice"
                          name="serviceprice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.serviceprice}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="pl-10 h-11 border-gray-300 focus:ring-red-600"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id="is_variable_price"
                          name="is_variable_price"
                          checked={formData.is_variable_price}
                          onChange={handleInputChange}
                          className="h-4 w-4 border-gray-300 rounded text-red-600 focus:ring-red-500"
                        />
                        <Label
                          htmlFor="is_variable_price"
                          className="text-xs text-gray-500 cursor-pointer"
                        >
                          Include "Starts From" prefix
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Duration <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={getDurationParts().hours}
                            onChange={(e) =>
                              handleDurationChange(
                                "hours",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-11 border-gray-300 focus:ring-red-600 pr-8"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                            HR
                          </span>
                        </div>
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={getDurationParts().minutes}
                            onChange={(e) =>
                              handleDurationChange(
                                "minutes",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-11 border-gray-300 focus:ring-red-600 pr-8"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                            MIN
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer Section */}
                <div
                  className={`p-5 rounded-xl border transition-all ${formData.has_offer ? "bg-red-50 border-red-100 ring-1 ring-red-100" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="has_offer"
                        name="has_offer"
                        checked={formData.has_offer}
                        onChange={handleInputChange}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-red-600 checked:bg-red-600 focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
                      />
                      <CheckCircle
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                        size={12}
                        strokeWidth={4}
                      />
                    </div>

                    <Label
                      htmlFor="has_offer"
                      className={`font-bold cursor-pointer select-none text-sm ${formData.has_offer ? "text-red-900" : "text-gray-600"}`}
                    >
                      Use Promotional Pricing
                    </Label>
                  </div>

                  {formData.has_offer && (
                    <div className="space-y-4 mt-4 animate-in slide-in-from-top-1">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="offer_price"
                            className="text-xs font-semibold uppercase tracking-wide text-red-800"
                          >
                            Discounted Price
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 font-medium sm:text-sm">
                              Rs.
                            </span>
                            <Input
                              id="offer_price"
                              name="offer_price"
                              type="number"
                              value={formData.offer_price}
                              onChange={handleInputChange}
                              className="pl-10 h-10 border-red-200 bg-white focus:ring-red-500"
                              placeholder="0.00"
                              required={formData.has_offer}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="offer_description"
                            className="text-xs font-semibold uppercase tracking-wide text-red-800"
                          >
                            Offer Label
                          </Label>
                          <Input
                            id="offer_description"
                            name="offer_description"
                            value={formData.offer_description}
                            onChange={handleInputChange}
                            className="h-10 border-red-200 bg-white focus:ring-red-500"
                            placeholder="e.g. Summer Sale"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="offer_start_date"
                            className="text-xs font-semibold text-red-800"
                          >
                            Start Date
                          </Label>
                          <Input
                            id="offer_start_date"
                            name="offer_start_date"
                            type="date"
                            min={today}
                            value={
                              formData.offer_start_date
                                ? formData.offer_start_date.split("T")[0]
                                : ""
                            }
                            onChange={handleInputChange}
                            className={`h-10 border-red-200 bg-white focus:ring-red-500 block w-full ${!formData.offer_start_date ? "text-gray-400" : ""}`}
                            required={formData.has_offer}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="offer_end_date"
                            className="text-xs font-semibold text-red-800"
                          >
                            End Date
                          </Label>
                          <Input
                            id="offer_end_date"
                            name="offer_end_date"
                            type="date"
                            min={today}
                            value={
                              formData.offer_end_date
                                ? formData.offer_end_date.split("T")[0]
                                : ""
                            }
                            onChange={handleInputChange}
                            className={`h-10 border-red-200 bg-white focus:ring-red-500 block w-full ${!formData.offer_end_date ? "text-gray-400" : ""}`}
                            required={formData.has_offer}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setShowEditForm(false);
                    }}
                    disabled={isSubmitting}
                    className="h-11 px-6 font-medium text-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 px-8 bg-red-600 hover:bg-red-700 font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : showAddForm ? (
                      "Add Service"
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default ManageServicesPage;
