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
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import advertisementService from "../../services/advertisement.service";
import { IMAGE_BASE_URL } from "@/configs/env";

const AdCard = ({ ad }) => {
  const expiryMeta = ad.expiry_date ? new Date(ad.expiry_date).toLocaleDateString() : null;
  const isExpired = ad.expiry_date && new Date(ad.expiry_date) < new Date();

  return (
    <article className="group flex flex-col relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-200">
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        {ad.image_url ? (
          <img
            src={`${IMAGE_BASE_URL}${ad.image_url}`}
            alt={ad.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <Megaphone size={40} className="text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
            isExpired ? "bg-red-50 text-red-700 border-red-100" : "bg-white/90 backdrop-blur-md text-gray-900 border-white/20"
          }`}>
            {isExpired ? "Expired" : "Active Partner"}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 space-y-4">
        <div className="space-y-2 flex-1">
          <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
            {ad.title}
          </h3>
          <p className="text-sm text-gray-500 font-medium line-clamp-2">
            Provided by <span className="text-gray-900 font-bold">{ad.client_name || "Premium Partner"}</span>
          </p>
        </div>

        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Connect</span>
            <span className="text-sm font-bold text-gray-900">{ad.client_contact || "Contact via desk"}</span>
          </div>
          <div className="p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
            <ExternalLink size={18} />
          </div>
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
  const [formData, setFormData] = useState({ title: "", client_name: "", client_contact: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await advertisementService.getAds();
      // Filter for active/published ads only
      setAds(Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []));
    } catch (err) {
      toast.error("Failed to load marketplace content");
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const activeAds = ads.filter(ad => ad.status === 'active' || !ad.status); // Default to active for legacy
    if (!query) return activeAds;
    return activeAds.filter(ad => 
      [ad.title, ad.client_name, ad.client_contact].some(v => String(v || "").toLowerCase().includes(query))
    );
  }, [ads, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Business name is required";
    if (!formData.client_name.trim()) newErrors.client_name = "Name is required";
    if (!formData.client_contact.trim() || !/^[0-9]{10}$/.test(formData.client_contact)) {
      newErrors.client_contact = "Valid 10-digit number required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await advertisementService.requestAd(formData);
      toast.success("Ad request submitted! We will contact you soon.");
      setFormData({ title: "", client_name: "", client_contact: "" });
    } catch (error) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const element = document.getElementById("post-ad-form");
    if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Hero / Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
              <Sparkles size={12} className="fill-current" />
              Community Marketplace
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">
              Partner Network & <br />
              <span className="text-red-600">Local Marketplace.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
              Explore trusted local businesses or showcase your own services to our growing community of vehicle owners.
            </p>
            <div className="flex gap-4 pt-4">
              <Button onClick={scrollToForm} size="lg" className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-100 transition-all hover:scale-105">
                Post Your Ad With Us
                <Plus className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Active Ads Section */}
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                Featured Partners
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-md font-black border border-gray-200 uppercase">
                  {filteredAds.length} Listings
                </span>
              </h2>
              <p className="text-gray-500 font-medium">Verified local businesses and specialist services.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search marketplace..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-sm font-semibold outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[400px] rounded-2xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-black text-gray-900">No Listings Found</h3>
              <p className="text-gray-500 font-medium mt-1">Try a different search or be the first to post!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAds.map(ad => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </div>

        {/* Post Ad Form Section */}
        <div id="post-ad-form" className="scroll-mt-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-none">
                  Reach Over 5,000 <br />
                  <span className="text-red-600">Active Customers.</span>
                </h2>
                <p className="text-lg text-gray-500 font-medium leading-relaxed">
                  Join our curated network of automotive partners. Our users are looking for mechanics, spare parts, insurance, and more.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: ShieldCheck, title: "Verified Partners", desc: "Gain trust with our 'Active Partner' badge." },
                  { icon: Zap, title: "Instant Visibility", desc: "Show up on the homepage and marketplace grid." },
                  { icon: MessageSquare, title: "Direct Connect", desc: "Get inquiries directly to your phone." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl h-max">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white">
              <div className="h-2 bg-red-600" />
              <CardContent className="p-10 pt-12 space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Submit Your Interest</h3>
                  <p className="text-gray-500 font-medium italic">Our team will call you back to finalize your banner.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Business Name</Label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Master Mechanic Garage"
                      className={`h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:bg-white transition-all font-bold ${errors.title ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Contact Name</Label>
                      <Input
                        name="client_name"
                        value={formData.client_name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className={`h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:bg-white transition-all font-bold ${errors.client_name ? "border-red-500 ring-1 ring-red-500" : ""}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Phone Number</Label>
                      <Input
                        name="client_contact"
                        value={formData.client_contact}
                        onChange={handleInputChange}
                        placeholder="07xxxxxxxx"
                        className={`h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:bg-white transition-all font-bold ${errors.client_contact ? "border-red-500 ring-1 ring-red-500" : ""}`}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-200 transition-all active:scale-95"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : "Request Fast Track"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
