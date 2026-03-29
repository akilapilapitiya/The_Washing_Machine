import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Search, Sparkles, Package, Wrench, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ServiceCard from "@/components/ServiceCard";
import ServiceDetailsModal from "./ServiceDetailsModal";
import * as serviceService from "@/services/service.service";
import { Button } from "@/components/ui/button";

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
    { key: "all", label: "All Services", icon: Sparkles, count: counts.all },
    {
      key: "packages",
      label: "Packages",
      icon: Package,
      count: counts.packages,
    },
    { key: "addons", label: "Add-ons", icon: Wrench, count: counts.addons },
    { key: "offers", label: "Offers", icon: Tag, count: counts.offers },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4 py-14 space-y-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm uppercase tracking-wider text-red-600 font-bold">
            Service Catalog
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            All Services, One Place
          </h1>
          <p className="text-gray-600">
            Browse every package and add-on. Use filters to quickly discover
            what fits your vehicle care goals and budget.
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;

              return (
                <Button
                  key={filter.key}
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`h-11 justify-start rounded-full border px-4 text-xs sm:text-sm font-semibold transition-all ${
                    activeFilter === filter.key
                      ? "border-red-200 bg-red-50 text-red-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} className="mr-2 shrink-0" />
                  <span>{filter.label}</span>
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold border ${activeFilter === filter.key ? "bg-white text-red-600 border-red-100" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                  >
                    {filter.count}
                  </span>
                </Button>
              );
            })}
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search services, categories, or offer labels"
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-sm outline-none focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
              <p className="text-gray-600">Loading services...</p>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-700 font-semibold mb-2">
                No services match this view.
              </p>
              <p className="text-gray-500 mb-6">
                Try another filter or clear your search.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
                className="border-gray-300"
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
