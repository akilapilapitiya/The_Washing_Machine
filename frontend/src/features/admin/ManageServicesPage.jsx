import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wrench,
  Plus,
  Trash2,
  Edit,
  X,
  CheckCircle,
  Banknote,
  Clock,
  AlertCircle,
  Loader2,
  Tag,
  Percent,
  Box,
  Layers,
} from "lucide-react";
import * as serviceService from "@/services/service.service";

const ManageServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    servicetype: "package",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.getServices();
      setServices(data);
    } catch (err) {
      setError(err.message || "Failed to load services");
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

  const resetForm = () => {
    setFormData({
      servicename: "",
      servicedetails: "",
      serviceprice: "",
      servicetime: "00:00",
      has_offer: false,
      offer_price: "",
      offer_description: "",
      servicetype: "package",
    });
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
        servicetype: formData.servicetype,
      };
      await serviceService.createService(payload);
      resetForm();
      setShowAddForm(false);
      setSuccessMessage("Service added successfully!");
      setShowSuccess(true);
      await fetchServices();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to add service");
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
        servicetype: formData.servicetype,
      };
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
      setShowSuccess(true);
      await fetchServices();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update service");
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
        setShowSuccess(true);
        await fetchServices();
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        setError(err.message || "Failed to delete service");
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
      servicetype: service.servicetype || "package",
    });
    setShowEditForm(true);
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
              Service Management
            </p>
            <h1 className="text-3xl font-bold">Manage Services</h1>
            <p className="text-gray-600">
              Add, edit, and manage all available services.
            </p>
          </div>
          <Button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus size={18} />
            Add Service
          </Button>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-red-600" />
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-12">
            {["package", "addon"].map((type) => {
              const typeServices = services.filter(
                (s) => (s.servicetype || "package") === type,
              );
              if (typeServices.length === 0) return null;

              return (
                <div key={type} className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    {type === "package" ? (
                      <Box className="text-red-600" />
                    ) : (
                      <Layers className="text-blue-600" />
                    )}
                    <h2 className="text-xl font-bold text-gray-900">
                      {type === "package"
                        ? "Service Packages"
                        : "Optional Add-ons"}
                    </h2>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {typeServices.map((service) => (
                      <Card
                        key={service.serviceid}
                        className={
                          service.has_offer ? "border-2 border-red-200" : ""
                        }
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {service.servicename}
                              </CardTitle>
                              {service.has_offer && (
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                                  <Tag size={12} /> Special Offer
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteService(service.serviceid)
                              }
                              disabled={isSubmitting}
                              className="text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                              title="Delete service"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {service.servicedetails}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Banknote
                                size={16}
                                className={
                                  service.has_offer
                                    ? "text-gray-400"
                                    : "text-green-600"
                                }
                              />
                              {service.has_offer ? (
                                <div className="flex items-center gap-2">
                                  <span className="line-through text-gray-400 font-medium">
                                    Rs. {service.serviceprice}
                                  </span>
                                  <span className="font-bold text-red-600 text-lg">
                                    Rs. {service.offer_price}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-semibold text-green-600">
                                  Rs. {service.serviceprice}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} className="text-gray-500" />
                              <span className="text-gray-700">
                                {service.servicetime}
                              </span>
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditForm(service)}
                              disabled={isSubmitting}
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <Edit size={14} />
                              Edit Service
                            </Button>
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
          <Card>
            <CardContent className="text-center py-12">
              <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first service to get started.
              </p>
              <Button onClick={openAddForm}>
                <Plus size={18} className="mr-2" />
                Add Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Service Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} className="text-red-600" />
                  Add New Service
                </CardTitle>
                <button
                  onClick={() => setShowAddForm(false)}
                  disabled={isSubmitting}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="servicename">Service Name *</Label>
                  <Input
                    id="servicename"
                    name="servicename"
                    value={formData.servicename}
                    onChange={handleInputChange}
                    placeholder="e.g., Exterior Wash"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input
                        type="radio"
                        name="servicetype"
                        value="package"
                        checked={formData.servicetype === "package"}
                        onChange={handleInputChange}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <Box size={16} className="text-gray-500" />
                      <div className="text-sm">
                        <span className="font-semibold block">Package</span>
                        <span className="text-xs text-gray-500">
                          Stand-alone service (Max 1)
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input
                        type="radio"
                        name="servicetype"
                        value="addon"
                        checked={formData.servicetype === "addon"}
                        onChange={handleInputChange}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <Layers size={16} className="text-gray-500" />
                      <div className="text-sm">
                        <span className="font-semibold block">Add-on</span>
                        <span className="text-xs text-gray-500">
                          Extra service (Multiple allowed)
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicedetails">Description *</Label>
                  <textarea
                    id="servicedetails"
                    name="servicedetails"
                    value={formData.servicedetails}
                    onChange={handleInputChange}
                    placeholder="Describe what this service includes..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="serviceprice">Price (Rs.) *</Label>
                    <Input
                      id="serviceprice"
                      name="serviceprice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.serviceprice}
                      onChange={handleInputChange}
                      placeholder="e.g., 1500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label
                          htmlFor="hours"
                          className="text-sm text-gray-600"
                        >
                          Hours
                        </Label>
                        <Input
                          id="hours"
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
                          className="mt-1"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor="minutes"
                          className="text-sm text-gray-600"
                        >
                          Minutes
                        </Label>
                        <Input
                          id="minutes"
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
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer Section */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="has_offer"
                      name="has_offer"
                      checked={formData.has_offer}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <Label
                      htmlFor="has_offer"
                      className="font-bold text-red-800 cursor-pointer"
                    >
                      Activate Promotional Offer
                    </Label>
                  </div>

                  {formData.has_offer && (
                    <div className="grid gap-4 md:grid-cols-2 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label htmlFor="offer_price" className="text-red-900">
                          Discounted Price (Rs.)
                        </Label>
                        <Input
                          id="offer_price"
                          name="offer_price"
                          type="number"
                          value={formData.offer_price}
                          onChange={handleInputChange}
                          className="border-red-200 focus:ring-red-500"
                          placeholder="e.g. 1200"
                          required={formData.has_offer}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="offer_description"
                          className="text-red-900"
                        >
                          Offer Label
                        </Label>
                        <Input
                          id="offer_description"
                          name="offer_description"
                          value={formData.offer_description}
                          onChange={handleInputChange}
                          className="border-red-200 focus:ring-red-500"
                          placeholder="e.g. Summer Sale"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Service"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditForm && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Edit size={20} className="text-red-600" />
                  Edit Service
                </CardTitle>
                <button
                  onClick={() => setShowEditForm(false)}
                  disabled={isSubmitting}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditService} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-servicename">Service Name *</Label>
                  <Input
                    id="edit-servicename"
                    name="servicename"
                    value={formData.servicename}
                    onChange={handleInputChange}
                    placeholder="e.g., Exterior Wash"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input
                        type="radio"
                        name="servicetype"
                        value="package"
                        checked={formData.servicetype === "package"}
                        onChange={handleInputChange}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <Box size={16} className="text-gray-500" />
                      <div className="text-sm">
                        <span className="font-semibold block">Package</span>
                        <span className="text-xs text-gray-500">
                          Stand-alone (Max 1)
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input
                        type="radio"
                        name="servicetype"
                        value="addon"
                        checked={formData.servicetype === "addon"}
                        onChange={handleInputChange}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <Layers size={16} className="text-gray-500" />
                      <div className="text-sm">
                        <span className="font-semibold block">Add-on</span>
                        <span className="text-xs text-gray-500">
                          Extra service
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-servicedetails">Description *</Label>
                  <textarea
                    id="edit-servicedetails"
                    name="servicedetails"
                    value={formData.servicedetails}
                    onChange={handleInputChange}
                    placeholder="Describe what this service includes..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-serviceprice">Price (Rs.) *</Label>
                    <Input
                      id="edit-serviceprice"
                      name="serviceprice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.serviceprice}
                      onChange={handleInputChange}
                      placeholder="e.g., 1500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label
                          htmlFor="edit-hours"
                          className="text-sm text-gray-600"
                        >
                          Hours
                        </Label>
                        <Input
                          id="edit-hours"
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
                          className="mt-1"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor="edit-minutes"
                          className="text-sm text-gray-600"
                        >
                          Minutes
                        </Label>
                        <Input
                          id="edit-minutes"
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
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer Section */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-has_offer"
                      name="has_offer"
                      checked={formData.has_offer}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <Label
                      htmlFor="edit-has_offer"
                      className="font-bold text-red-800 cursor-pointer"
                    >
                      Activate Promotional Offer
                    </Label>
                  </div>

                  {formData.has_offer && (
                    <div className="grid gap-4 md:grid-cols-2 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-offer_price"
                          className="text-red-900"
                        >
                          Discounted Price (Rs.)
                        </Label>
                        <Input
                          id="edit-offer_price"
                          name="offer_price"
                          type="number"
                          value={formData.offer_price}
                          onChange={handleInputChange}
                          className="border-red-200 focus:ring-red-500"
                          placeholder="e.g. 1200"
                          required={formData.has_offer}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-offer_description"
                          className="text-red-900"
                        >
                          Offer Label
                        </Label>
                        <Input
                          id="edit-offer_description"
                          name="offer_description"
                          value={formData.offer_description}
                          onChange={handleInputChange}
                          className="border-red-200 focus:ring-red-500"
                          placeholder="e.g. Summer Sale"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Service"
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
