import React, { useState, useEffect } from "react";
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
import { getServices } from "@/services/service.service";
import { COLORS } from "@/lib/colors";

const ServicesSection = ({ id }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping for services (using red theme)
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

  // Default icon for services not in the map
  const defaultIcon = {
    icon: Sparkles,
    color: COLORS.icon.brand,
    bgColor: COLORS.bg.brandLight,
  };

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

  return (
    <section id={id} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Premium Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From quick washes to complete detailing, we offer a full range of
            professional car care services tailored to your needs.
          </p>
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
        {!loading && !error && services.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {services.map((service) => (
                <ServiceCard key={service.serviceid} service={service} />
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <Link to="/services">
                <Button size="lg" className="text-lg px-8">
                  View All Services
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
      </div>
    </section>
  );
};

export default ServicesSection;
