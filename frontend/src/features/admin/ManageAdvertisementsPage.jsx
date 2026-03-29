import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import advertisementService from "../../services/advertisement.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Calendar,
  User,
  Phone,
  Loader2,
  BarChart3,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Zap,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import PageToolbar from "@/components/common/PageToolbar";

const ManageAdvertisementsPage = () => {
  useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("live"); // "live" or "requests"
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();

  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    client_contact: "",
    expiry_date: "",
    image: null,
  });

  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split("T")[0];

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getAdminAds();
      setAds(response.data);
    } catch {
      toast.error("Failed to fetch advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.client_name.trim())
      newErrors.client_name = "Client name is required";

    if (formData.client_contact) {
      if (!/^[0-9]{10}$/.test(formData.client_contact)) {
        newErrors.client_contact = "Contact number must be 10 digits";
      }
    }

    // Require image for new ads OR when promoting a request
    const isPromoting = editingAd && editingAd.status === "requested";
    if ((!editingAd || isPromoting) && !formData.image) {
      newErrors.image = "Ad banner image is required to go live";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("client_name", formData.client_name);
    data.append("client_contact", formData.client_contact);
    if (formData.expiry_date) data.append("expiry_date", formData.expiry_date);
    if (formData.image) data.append("image", formData.image);

    // If we're promoting a request, set status to active
    if (editingAd && editingAd.status === "requested") {
      data.append("status", "active");
    }

    try {
      if (editingAd) {
        await advertisementService.updateAd(editingAd.id, data);
        toast.success(
          editingAd.status === "requested"
            ? "Ad promoted to live successfully!"
            : "Advertisement updated successfully",
        );
      } else {
        await advertisementService.createAd(data);
        toast.success("Advertisement created successfully");
      }
      setIsModalOpen(false);
      setEditingAd(null);
      setFormData({
        title: "",
        client_name: "",
        client_contact: "",
        expiry_date: "",
        image: null,
      });
      fetchAds();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save advertisement",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      variant: "destructive",
      title: "Delete Advertisement?",
      description:
        "Are you sure you want to delete this advertisement? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      try {
        await advertisementService.deleteAd(id);
        toast.success("Advertisement deleted");
        fetchAds();
      } catch {
        toast.error("Failed to delete advertisement");
      }
    }
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      client_name: ad.client_name || "",
      client_contact: ad.client_contact || "",
      expiry_date: ad.expiry_date ? ad.expiry_date.split("T")[0] : "",
      image: null,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const liveAds = ads.filter((ad) => ad.status !== "requested");
  const requestAds = ads.filter((ad) => ad.status === "requested");

  const activeAds = liveAds.filter(
    (ad) => !ad.expiry_date || new Date(ad.expiry_date) >= new Date(),
  );
  const expiredAds = liveAds.filter(
    (ad) => ad.expiry_date && new Date(ad.expiry_date) < new Date(),
  );

  // Ads expiring within the next 3 days
  const expiringSoonAds = ads.filter((ad) => {
    if (!ad.expiry_date) return false;
    const expiryDate = new Date(ad.expiry_date);
    const now = new Date();
    const diffInDays = (expiryDate - now) / (1000 * 60 * 60 * 24);
    return diffInDays >= 0 && diffInDays <= 3;
  });

  // Memoize action button for stable reference
  const headerAction = React.useMemo(
    () => (
      <Button
        onClick={() => {
          setEditingAd(null);
          setFormData({
            title: "",
            client_name: "",
            client_contact: "",
            expiry_date: "",
            image: null,
          });
          setErrors({});
          setIsModalOpen(true);
        }}
        className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wide rounded-lg shadow-sm"
      >
        <Plus className="w-4 h-4 mr-2" /> Add New Ad
      </Button>
    ),
    [],
  );

  // Prepare Toolbar (SubHeader row 2)
  const toolbar = useMemo(
    () => (
      <PageToolbar
        filters={[
          {
            id: "live",
            label: "Live Advertisements",
          },
          {
            id: "requests",
            label: `Public Requests ${requestAds.length > 0 ? "•" : ""}`,
          },
        ]}
        activeFilter={activeTab}
        onFilterChange={setActiveTab}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search advertisements..."
        searchWidthClass="sm:w-80"
      />
    ),
    [liveAds.length, requestAds.length, activeTab, searchQuery],
  );

  useSetPageHeader(
    "Content Management",
    "Advertisement Manager",
    "Manage promotional banners and client advertisements.",
    headerAction,
    toolbar,
  );

  const columns = [
    // ... columns remain the same
    {
      key: "preview",
      label: "Preview",
      render: (row) => (
        <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
          {row.image_url ? (
            <img
              loading="lazy"
              src={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${row.image_url}`}
              alt={row.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={16} className="text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: "details",
      label: "Ad Details",
      render: (row) => (
        <span className="font-bold text-gray-900">{row.title}</span>
      ),
    },
    {
      key: "client",
      label: "Client Info",
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-gray-700">
            {row.client_name || "N/A"}
          </p>
          <p className="text-xs text-gray-500">{row.client_contact || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "status_expiry",
      label: "Status & Expiry",
      render: (row) => {
        const isExpired =
          row.expiry_date && new Date(row.expiry_date) < new Date();
        return (
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border w-max ${
                isExpired
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {isExpired ? "Expired" : "Active"}
            </span>
            <p className="text-xs text-gray-500">
              {row.expiry_date
                ? new Date(row.expiry_date).toLocaleDateString()
                : "No Expiry"}
            </p>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === "requested" && (
            <button
              onClick={() => openEditModal(row)}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
              title="Promote to Live Ad"
            >
              <Zap size={14} className="fill-current" />
              Promote
            </button>
          )}
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Edit Ad"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Ad"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading && ads.length === 0)
    return <PageLoader message="Loading advertisements..." />;

  return (
    <div>
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Expiring Soon Alert */}
        {expiringSoonAds.length > 0 && activeTab === "live" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <Clock size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">
                  Expiring Soon
                </h3>
                <p className="text-sm text-amber-700 font-medium">
                  The following advertisements will disappear from the front
                  page within 3 days.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {expiringSoonAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white border border-amber-100 p-3 rounded-lg flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-50 overflow-hidden border border-gray-100">
                      {ad.image_url && (
                        <img
                          loading="lazy"
                          src={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${ad.image_url}`}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">
                        {ad.title}
                      </p>
                      <p className="text-[10px] font-bold text-amber-600 uppercase">
                        Expires: {new Date(ad.expiry_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(ad)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Renew/Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && ads.length > 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-red-600" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={
              activeTab === "live"
                ? liveAds.filter((ad) => {
                    const query = searchQuery.trim().toLowerCase();
                    if (!query) return true;
                    return [ad.title, ad.client_name, ad.client_contact].some(
                      (v) =>
                        String(v || "")
                          .toLowerCase()
                          .includes(query),
                    );
                  })
                : requestAds.filter((ad) => {
                    const query = searchQuery.trim().toLowerCase();
                    if (!query) return true;
                    return [ad.title, ad.client_name, ad.client_contact].some(
                      (v) =>
                        String(v || "")
                          .toLowerCase()
                          .includes(query),
                    );
                  })
            }
            keyField="id"
            emptyIcon={activeTab === "live" ? ImageIcon : Megaphone}
            emptyTitle={
              activeTab === "live"
                ? "No live advertisements"
                : "No pending requests"
            }
            emptySubtitle={
              activeTab === "live"
                ? "Your active promotional content will appear here."
                : "New advertisement requests from the 'Post Your Ad' page will show up here."
            }
            emptyAction={
              activeTab === "live" && (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 font-bold mt-4"
                >
                  <Plus size={16} className="mr-2" />
                  Create Advertisement
                </Button>
              )
            }
          />
        )}
      </div>

      <ConfirmDialog />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 bg-white/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${editingAd ? (editingAd.status === "requested" ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-700") : "bg-red-50 text-red-600"}`}
                  >
                    {editingAd ? (
                      editingAd.status === "requested" ? (
                        <Zap size={20} />
                      ) : (
                        <Edit2 size={20} />
                      )
                    ) : (
                      <Plus size={20} />
                    )}
                  </div>
                  {editingAd
                    ? editingAd.status === "requested"
                      ? "Promote Advertisement"
                      : "Edit Advertisement"
                    : "Create Advertisement"}
                </CardTitle>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Display Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer Special Wash Offer"
                    className={`h-11 border-gray-300 focus:ring-red-600 ${errors.title ? "border-red-500" : ""}`}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="client_name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Client Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="client_name"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      placeholder="Agency or Person"
                      className={`h-11 border-gray-300 ${errors.client_name ? "border-red-500" : ""}`}
                    />
                    {errors.client_name && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.client_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="client_contact"
                      className="text-sm font-medium text-gray-700"
                    >
                      Contact Number
                    </Label>
                    <Input
                      id="client_contact"
                      name="client_contact"
                      value={formData.client_contact}
                      onChange={handleInputChange}
                      placeholder="10 Digits"
                      className={`h-11 border-gray-300 ${errors.client_contact ? "border-red-500" : ""}`}
                    />
                    {errors.client_contact && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.client_contact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="expiry_date"
                      className="text-sm font-medium text-gray-700"
                    >
                      Expiry Date
                    </Label>
                    <div className="relative">
                      <Input
                        id="expiry_date"
                        name="expiry_date"
                        type="date"
                        min={today}
                        value={formData.expiry_date}
                        onChange={handleInputChange}
                        className="h-11 border-gray-300 focus:ring-red-600 pl-10"
                      />
                      <Calendar
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="image"
                      className="text-sm font-medium text-gray-700"
                    >
                      Ad Banner{" "}
                      <span className="text-red-500">{!editingAd && "*"}</span>
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={`h-11 border-gray-300 pt-1.5 ${errors.image ? "border-red-500" : ""}`}
                    />
                    {errors.image && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.image}
                      </p>
                    )}
                    {editingAd && !formData.image && (
                      <p className="text-[10px] text-gray-500">
                        Leave blank to keep current image
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-[2] h-11 font-bold ${editingAd?.status === "requested" ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingAd ? (
                      editingAd.status === "requested" ? (
                        "Activate & Post Ad"
                      ) : (
                        "Update Advertisement"
                      )
                    ) : (
                      "Create Advertisement"
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

export default ManageAdvertisementsPage;
