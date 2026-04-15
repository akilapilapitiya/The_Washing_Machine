import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ServiceCard from "@/components/ServiceCard";
import ServiceDetailsModal from "./ServiceDetailsModal";
import * as serviceService from "@/services/service.service";
import { Button } from "@/components/ui/button";
import Footer from "../home/Footer";
import { toast } from "sonner";

const isOfferActive = (service) => {
  if (!service?.has_offer) return false;
  if (service.offer_price === null || service.offer_price === undefined) {
    return false;
  }

  const now = new Date();
  const startsAt = service.offer_start_date
    ? new Date(service.offer_start_date)
    : null;
  const endsAt = service.offer_end_date
    ? new Date(service.offer_end_date)
    : null;

  if (startsAt && Number.isNaN(startsAt.getTime())) return false;
  if (endsAt && Number.isNaN(endsAt.getTime())) return false;
  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;

  return true;
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      toast.dismiss();
      const response = await serviceService.getServices();
      setServices(response || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      toast.error(err.message || "Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const packages = services.filter(
      (service) => (service.servicetype || "package") === "package",
    ).length;
    const addons = services.filter(
      (service) => (service.servicetype || "package") === "addon",
    ).length;
    const offers = services.filter((service) => isOfferActive(service)).length;

    return {
      all: services.length,
      packages,
      addons,
      offers,
    };
  }, [services]);

  const filteredServices = useMemo(() => {
    let list = services;

    if (activeFilter === "packages") {
      list = list.filter(
        (service) => (service.servicetype || "package") === "package",
      );
    }

    if (activeFilter === "addons") {
      list = list.filter(
        (service) => (service.servicetype || "package") === "addon",
      );
    }

    if (activeFilter === "offers") {
      list = list.filter((service) => isOfferActive(service));
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter((service) =>
      [
        service.servicename,
        service.short_description,
        service.servicedetails,
        service.category,
        service.offer_description,
      ]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(query)),
    );
  }, [activeFilter, searchQuery, services]);

  const filters = [
    { key: "all", label: "All Services", count: counts.all },
    { key: "packages", label: "Packages", count: counts.packages },
    { key: "addons", label: "Add-ons", count: counts.addons },
    { key: "offers", label: "Live Offers", count: counts.offers },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto px-4 py-16 lg:py-24 space-y-16 max-w-7xl flex-1">
        
        {/* Header Section */}
        <div className="text-center flex flex-col items-center">

          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight">
            All Services, One Place
          </h1>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col items-center space-y-8">
          {/* Search Input */}
          <div className="w-full max-w-2xl relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search services, categories, or offer labels..."
              className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-6 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all shadow-sm font-medium"
            />
          </div>

          {/* Premium Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`h-12 px-8 rounded-xl text-sm font-black tracking-tight transition-all duration-300 flex items-center gap-4 border ${
                  activeFilter === filter.key
                    ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200"
                    : "bg-white text-gray-400 border-gray-100 hover:border-red-200 hover:text-red-600 shadow-sm"
                }`}
              >
                {filter.label}
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-colors ${
                    activeFilter === filter.key ? "bg-white/10 text-gray-300" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-gray-50 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
            <AlertCircle size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-900 text-xl font-black mb-2">
              No services match your search.
            </p>
            <p className="text-gray-500 mb-8 max-w-xs">
              Try adjusting your filters or search keywords to find what you need.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="rounded-xl border-gray-200 h-10 px-6 font-bold"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.serviceid}
                service={service}
                onReadMore={setSelectedService}
              />
            ))}
          </div>
        )}
      </div>

      <Footer id="contact" />

      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};

export default ServicesPage;
