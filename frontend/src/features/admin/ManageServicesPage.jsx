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
  Clock
  Loader2,
  Tag,
  Box,
  Layers} from "lucide-react";
import * as serviceService from "@/services/service.service";

import { toast } from "sonner";
const ManageServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    servicename: "",
    servicedetails: "",
    serviceprice: "",
    servicetime: "00:00",
    has_offer: false,
    offer_price: "",
    offer_description: "",
    servicetype: "package"});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      toast.error(null);
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
      [name]: type === "checkbox" ? checked : value}));
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

  const resetForm = () => {
    setFormData({
      servicename: "",
      servicedetails: "",
      serviceprice: "",
      servicetime: "00:00",
      has_offer: false,
      offer_price: "",
      offer_description: "",
      servicetype: "package"});
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        servicename: formData.servicename,
        servicedetails: formData.servicedetails,
        serviceprice: parseFloat(formData.serviceprice),
        servicetime: formData.servicetime,
        has_offer: formData.has_offer,
        offer_price: formData.has_offer
          ? parseFloat(formData.offer_price)
          : null,
        offer_description: formData.has_offer
          ? formData.offer_description
          : null,
        servicetype: formData.servicetype};
      await serviceService.createService(payload);
      resetForm();
      setShowAddForm(false);
      setSuccessMessage("Service added successfully!");
      toast.success("Operation completed successfully");
      await fetchServices();    } catch (err) {
      toast.error(err.message || "Failed to add service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        servicename: formData.servicename,
        servicedetails: formData.servicedetails,
        servicetime: formData.servicetime,
        has_offer: formData.has_offer,
        offer_price: formData.has_offer
          ? parseFloat(formData.offer_price)
          : null,
        offer_description: formData.has_offer
          ? formData.offer_description
          : null,
        servicetype: formData.servicetype};
      // Only include serviceprice if it's a valid number
      const price = parseFloat(formData.serviceprice);
      if (!isNaN(price) && formData.serviceprice !== "") {
        payload.serviceprice = price;
      }
      await serviceService.updateService(selectedService.serviceid, payload);
      resetForm();
      setShowEditForm(false);
      setSelectedService(null);
      setSuccessMessage("Service updated successfully!");
      toast.success("Operation completed successfully");
      await fetchServices();    } catch (err) {
      toast.error(err.message || "Failed to update service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (serviceid) => {
    if (
      window.confirm(
        "Are you sure you want to delete this service? This action cannot be undone.",
      )
    ) {
      try {
        setIsSubmitting(true);
        await serviceService.deleteService(serviceid);
        setSuccessMessage("Service deleted successfully!");
        toast.success("Operation completed successfully");
        await fetchServices();      } catch (err) {
        toast.error(err.message || "Failed to delete service");
      } finally {
        setIsSubmitting(false);
      }
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
      servicetype: service.servicetype || "package"});
    setShowEditForm(true);
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8 max-w-7xl">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Service Registry
            </h1>
            <p className="text-gray-500">
              Add, edit, and manage all available services.
            </p>
          </div>
          <Button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white h-10 px-4 rounded-lg shadow-sm"
          >
            <Plus size={18} />
            Add Service
          </Button>
        </div>

{loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-red-600" />
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-10">
            {["package", "addon"].map((type) => {
              const typeServices = services.filter(
                (s) => (s.servicetype || "package") === type,
              );
              if (typeServices.length === 0) return null;

              return (
                <div key={type} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    {type === "package" ? (
                      <Box className="text-red-600" size={20} />
                    ) : (
                      <Layers className="text-blue-600" size={20} />
                    )}
                    <h2 className="text-lg font-bold text-gray-900">
                      {type === "package"
                        ? "Service Packages"
                        : "Optional Add-ons"}
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {typeServices.map((service) => (
                      <Card
                        key={service.serviceid}
                        className={`hover:shadow-md transition-all border-gray-200 h-full flex flex-col ${
                          service.has_offer ? "border-red-200" : ""
                        }`}
                      >
                        <CardHeader className="pb-3 pt-5 px-5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base font-bold text-gray-900">
                                {service.servicename}
                              </CardTitle>
                              {service.has_offer && (
                                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 border border-red-100">
                                  <Tag size={10} /> SPECIAL OFFER
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => openEditForm(service)}
                                disabled={isSubmitting}
                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteService(service.serviceid)
                                }
                                disabled={isSubmitting}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 px-5 pb-5 flex-1 flex flex-col">
                          <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                            {service.servicedetails}
                          </p>

                          <div className="pt-4 border-t border-gray-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock size={16} />
                                <span>{service.servicetime} hrs</span>
                              </div>

                              {service.has_offer ? (
                                <div className="text-right">
                                  <div className="text-xs text-gray-400 line-through font-medium">
                                    Rs. {service.serviceprice}
                                  </div>
                                  <div className="text-lg font-bold text-red-600">
                                    Rs. {service.offer_price}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-lg font-bold text-gray-900">
                                  Rs. {service.serviceprice}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-white">
            <div className="p-4 bg-gray-50 rounded-full w-max mx-auto mb-4">
              <Box size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No services yet
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Add your first service package to get started.
            </p>
            <Button
              onClick={openAddForm}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus size={16} className="mr-2" />
              Add Service
            </Button>
          </div>
        )}
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

                  <div className="space-y-2">
                    <Label
                      htmlFor="servicedetails"
                      className="text-sm font-medium text-gray-700"
                    >
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="servicedetails"
                      name="servicedetails"
                      value={formData.servicedetails}
                      onChange={handleInputChange}
                      placeholder="Detail what is included in this service..."
                      rows={3}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none text-sm transition-shadow"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="serviceprice"
                        className="text-sm font-medium text-gray-700"
                      >
                        Price (Rs.) <span className="text-red-500">*</span>
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
                    <div className="grid gap-4 md:grid-cols-2 mt-4 animate-in slide-in-from-top-1">
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
                    className="h-11 px-8 bg-red-600 hover:bg-red-700 font-bold shadow-md shadow-red-100"
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
    </div>
  );
};

export default ManageServicesPage;
