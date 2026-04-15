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
  Tag,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import ServiceDetailsModal from "@/features/services/ServiceDetailsModal";
import { getServices } from "@/services/service.service";
import { COLORS } from "@/lib/colors";

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
    <section id={id} className="pt-28 pb-20 bg-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        {/* Section Header - Left Aligned to match Brand Path */}
        <div className="mb-20">
          <div className="h-[1px] w-12 bg-red-600 mb-6"></div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight uppercase tracking-tighter mb-4">
            Services & Exclusive Offers
          </h2>
          <p className="text-gray-500 font-medium max-w-xl">
            Explore our meticulously curated service selection. From express
            maintenance to high-end detailing, were store your vehicle to its
            peak condition.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-gray-100 animate-pulse h-64 w-full"
              ></div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Failed to load services
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && activeOfferServices.length > 0 && (
          <>
            <div className="space-y-8 mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                  <h3 className="text-3xl font-black text-gray-900">
                    Live Offers
                  </h3>
                </div>
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
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm h-12 px-8 transition-all duration-300"
                >
                  See More Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Empty State - No Services at all */}
        {!loading && !error && services.length === 0 && (
          <div className="text-center py-20 bg-white">
            <p className="text-gray-500 text-lg">
              No services available at the moment.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          services.length > 0 &&
          activeOfferServices.length === 0 && (
            <div className="text-center py-16 px-4 bg-white flex flex-col items-center">
              <Tag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-900 text-xl font-bold mb-2">
                No live offers right now.
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                We currently don't have any special promotions running, but you
                can explore the full service catalog for our complete range.
              </p>
              <Link to="/services">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm h-12 px-8 transition-all duration-300"
                >
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
