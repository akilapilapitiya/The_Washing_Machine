import React, { useState, useEffect, useMemo } from "react";
import {
  Megaphone,
  Search,
  Plus,
  ShieldCheck,
  Zap,
  Loader2,
  Phone,
  User,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Store,
  Clock3,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import advertisementService from "../../services/advertisement.service";
import { IMAGE_BASE_URL } from "@/configs/env";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import PageToolbar from "@/components/common/PageToolbar";

const AdCard = ({ ad }) => {
  const isExpired = ad.expiry_date && new Date(ad.expiry_date) < new Date();
  const expiryText = ad.expiry_date
    ? new Date(ad.expiry_date).toLocaleDateString()
    : null;

  return (
    <article className="group flex flex-col relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-red-200">
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        {ad.image_url ? (
          <img
            src={`${IMAGE_BASE_URL}${ad.image_url}`}
            alt={ad.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-gray-100">
            <Megaphone size={48} className="text-red-200" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
              isExpired
                ? "bg-red-600 text-white border-red-700"
                : "bg-white text-gray-900 border-gray-200"
            }`}
          >
            {isExpired ? "Expired" : "Active Partner"}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 text-[11px] font-medium border border-white/20">
            <User size={12} />
            {ad.client_name || "Auto Partner"}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 space-y-4">
        <div className="space-y-2 flex-1">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {ad.title}
          </h3>
          <p className="text-gray-600 leading-relaxed line-clamp-2 text-sm">
            Discover premium services and products from our trusted partner
            network.
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-gray-100 pt-4 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
              Contact
            </span>
            <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
              {ad.client_contact || "N/A"}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4 h-9 text-xs font-semibold text-gray-700 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
          >
            Insights
            <ExternalLink size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </article>
  );
};

const MarketplacePage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    client_contact: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getAds();
      setAds(
        Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [],
      );
    } catch (err) {
      toast.error("Failed to load marketplace content");
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const activeAds = ads.filter((ad) => ad.status === "active" || !ad.status);
    if (!query) return activeAds;
    return activeAds.filter((ad) =>
      [ad.title, ad.client_name, ad.client_contact].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [ads, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Business name is required";
    if (!formData.client_name.trim())
      newErrors.client_name = "Name is required";
    if (
      !formData.client_contact.trim() ||
      !/^[0-9]{10}$/.test(formData.client_contact)
    ) {
      newErrors.client_contact = "Valid 10-digit number required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await advertisementService.requestAd(formData);
      toast.success("Ad request submitted successfully!", {
        description: "Our team will contact you soon to finalize details.",
      });
      setFormData({ title: "", client_name: "", client_contact: "" });
    } catch (error) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const element = document.getElementById("post-ad-form");
    if (element)
      element.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const headerAction = useMemo(
    () => (
      <Button
        onClick={scrollToForm}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm"
      >
        <Plus size={16} className="mr-2" />
        Post Your Ad
      </Button>
    ),
    [],
  );

  const toolbar = useMemo(
    () => (
      <PageToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search partners, services..."
        stats={[
          {
            icon: Store,
            label: "Live Listings",
            value: filteredAds.length,
            iconClassName: "text-blue-500",
          },
          {
            icon: ShieldCheck,
            label: "Verified",
            value: filteredAds.length,
            iconClassName: "text-green-500",
          },
        ]}
      />
    ),
    [searchQuery, filteredAds.length],
  );

  useSetPageHeader(
    "Marketplace",
    "Community & Partner Directory",
    "Discover local automotive services and partner offerings.",
    headerAction,
    toolbar,
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 max-w-7xl">
      {/* Featured Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[400px] rounded-xl bg-gray-100 animate-pulse border border-gray-200"
              />
            ))}
          </div>
        ) : filteredAds.length === 0 ? (
          <Card className="border-dashed py-16">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-gray-50 rounded-full">
                <Megaphone size={40} className="text-gray-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">
                  No Partners Found
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Try a different search or clear your filters to see active
                  listings.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: ShieldCheck,
            title: "Verified Partners",
            desc: "Every business in our directory is manually verified for quality and reliability.",
          },
          {
            icon: Zap,
            title: "Exclusive Offers",
            desc: "Many of our partners provide special discounts directly to our community members.",
          },
          {
            icon: MessageSquare,
            title: "Direct Connect",
            desc: "No middleman. Contact our automotive partners directly for estimates and bookings.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-3"
          >
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg w-fit">
              <item.icon size={20} />
            </div>
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider">
              {item.title}
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Submission Form */}
      <div id="post-ad-form" className="scroll-mt-32 max-w-4xl mx-auto w-full">
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-gray-900 p-10 text-white flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                  Marketplace Ads
                </span>
                <h2 className="text-3xl font-bold leading-tight">
                  Post Your Ad With Us
                </h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Reach thousands of vehicle owners every month. Submit your
                details below and our marketing team will contact you to design
                and launch your banner.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-sm font-medium">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Premium Homepage Spotlight
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Detailed Business Directory
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Priority Marketplace Placement
                </li>
              </ul>
            </div>

            <CardContent className="p-10 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Store size={18} className="text-red-600" />
                Partner Application
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    Business Name *
                  </Label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Acme Auto Parts"
                    className={`h-11 border-gray-200 focus:ring-red-500 ${errors.title ? "border-red-500 bg-red-50/20" : ""}`}
                  />
                  {errors.title && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    Contact Person *
                  </Label>
                  <Input
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    className={`h-11 border-gray-200 focus:ring-red-500 ${errors.client_name ? "border-red-500 bg-red-50/20" : ""}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    name="client_contact"
                    value={formData.client_contact}
                    onChange={handleInputChange}
                    placeholder="07XXXXXXXX"
                    className={`h-11 border-gray-200 focus:ring-red-500 ${errors.client_contact ? "border-red-500 bg-red-50/20" : ""}`}
                  />
                  {errors.client_contact && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">
                      {errors.client_contact}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold transition-all mt-4"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Submitting...
                    </>
                  ) : (
                    "Submit Interest"
                  )}
                </Button>
              </form>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketplacePage;
