import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  Sparkles,
  Wind,
  Zap,
  Car,
  Brush,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import ServiceDetailsModal from "@/features/services/ServiceDetailsModal";
import { getServices } from "@/services/service.service";
import { COLORS } from "@/lib/colors";

import img1 from "../../assets/serviceAssets/image1.png";
import img2 from "../../assets/serviceAssets/image2.png";
import img3 from "../../assets/serviceAssets/image3.png";
import img4 from "../../assets/serviceAssets/image4.png";

const isOfferActive = (service) => {
  if (!service?.has_offer) return false;
  if (service.offer_price === null || service.offer_price === undefined) {
    return false;
  }

  const now = new Date();
  const startsAt = service.offer_start_date
    ? new Date(service.offer_start_date)
    : null;
  const endsAt = service.offer_end_date ? new Date(service.offer_end_date) : null;

  if (startsAt && Number.isNaN(startsAt.getTime())) return false;
  if (endsAt && Number.isNaN(endsAt.getTime())) return false;
  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;

  return true;
};

const iconMap = {
  "Full Body Wash": {
    icon: Droplets,
    color: COLORS.icon.brand,
    bgColor: COLORS.bg.brandLight,
  },
  "Premium Detailing": {
    icon: Sparkles,
    color: COLORS.icon.brand,
    bgColor: COLORS.bg.brandLight,
  },
  "Interior Cleaning": {
    icon: Wind,
    color: COLORS.icon.brand,
    bgColor: COLORS.bg.brandLight,
  },
  "Express Wash": {
    icon: Zap,
    color: COLORS.icon.brand,
    bgColor: COLORS.bg.brandLight,
  },
  "Paint Protection": {
    icon: Car,
    color: COLORS.icon.brand,
    bgColor: COLORS.bg.brandLight,
  },
  "Wheel Polishing": {
    icon: Brush,
    color: COLORS.icon.brand,
    bgColor: COLORS.bg.brandLight,
  },
};

const defaultIcon = {
  icon: Sparkles,
  color: COLORS.icon.brand,
  bgColor: COLORS.bg.brandLight,
};

const ServicesSection = ({ id }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  // Fetch services from API on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getServices();

        // Map API data to include icons and styling
        const servicesWithIcons = data.map((service) => {
          const iconConfig = iconMap[service.servicename] || defaultIcon;
          return {
            ...service,
            ...iconConfig,
            popular: service.servicename === "Full Body Wash", // Mark first service as popular
          };
        });

        setServices(servicesWithIcons);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const activeOfferServices = useMemo(
    () => services.filter((service) => isOfferActive(service)),
    [services],
  );

  return (
    <section id={id} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Premium Services & Live Offers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our premium workmanship gallery, then browse the services
            that are currently running special offer pricing.
          </p>
        </div>

        {/* Visual Showcase Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[img1, img2, img3, img4].map((img, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <img
                src={img}
                alt={`Premium Service ${index + 1}`}
                className="w-full h-auto block"
              />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2
              className={`h-12 w-12 animate-spin ${COLORS.icon.brand}`}
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && activeOfferServices.length > 0 && (
          <>
            <div className="space-y-8 mb-12">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-2xl font-bold text-gray-900 border-l-4 border-red-600 pl-4">
                  Services On Offer Right Now
                </h3>
                <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-extrabold uppercase tracking-widest">
                  Limited Time
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeOfferServices.map((service) => (
                  <ServiceCard
                    key={service.serviceid}
                    service={service}
                    onReadMore={setSelectedService}
                  />
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <Link to="/services">
                <Button size="lg" className="text-lg px-8">
                  See More Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              No services available at the moment.
            </p>
          </div>
        )}

        {!loading && !error && services.length > 0 && activeOfferServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-700 text-lg font-semibold mb-2">
              No live offers right now.
            </p>
            <p className="text-gray-500 mb-6">
              Explore the full service catalog for our complete range.
            </p>
            <Link to="/services">
              <Button size="lg" className="text-base px-6">
                See More Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </section>
  );
};

export default ServicesSection;
