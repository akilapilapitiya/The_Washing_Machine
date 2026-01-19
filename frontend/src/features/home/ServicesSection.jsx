import React from "react";
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
} from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: Droplets,
      title: "Full Body Wash",
      description:
        "Complete exterior wash with premium soap, hand drying, and tire shine for a spotless finish.",
      price: "From Rs. 2,500",
      popular: true,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Sparkles,
      title: "Premium Detailing",
      description:
        "Comprehensive interior and exterior detailing with waxing, polishing, and protection.",
      price: "From Rs. 7,500",
      popular: false,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Wind,
      title: "Interior Cleaning",
      description:
        "Deep cleaning of seats, carpets, dashboard, and all interior surfaces with vacuum.",
      price: "From Rs. 3,500",
      popular: false,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Zap,
      title: "Express Wash",
      description:
        "Quick exterior wash and dry for busy schedules. In and out in 15 minutes.",
      price: "From Rs. 1,500",
      popular: false,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Car,
      title: "Paint Protection",
      description:
        "Ceramic coating and protective sealant to keep your car's paint pristine and protected.",
      price: "From Rs. 12,000",
      popular: false,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Brush,
      title: "Wheel Polishing",
      description:
        "Professional wheel cleaning, polishing, and tire treatment for a premium look.",
      price: "From Rs. 2,000",
      popular: false,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
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

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 relative group"
              >
                {service.popular && (
                  <div className="absolute -top-3 right-6">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}

                <div
                  className={`inline-flex items-center justify-center w-14 h-14 ${service.bgColor} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`h-7 w-7 ${service.color}`} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-900">
                    {service.price}
                  </span>
                  <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            );
          })}
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
      </div>
    </section>
  );
};

export default ServicesSection;
