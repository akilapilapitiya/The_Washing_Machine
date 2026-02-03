import React from "react";
import { ArrowRight } from "lucide-react";
import { COLORS } from "@/lib/colors";

/**
 * Reusable ServiceCard Component
 * Displays service information with icon, title, description, and price
 *
 * @param {Object} service - Service data object
 * @param {React.Component} service.icon - Lucide icon component
 * @param {string} service.servicename - Service name/title
 * @param {string} service.servicedetails - Service description
 * @param {number} service.serviceprice - Service price
 * @param {number} service.servicetime - Service duration in minutes
 * @param {boolean} service.popular - Whether service is marked as popular
 * @param {string} service.color - Icon color class (e.g., "text-blue-600")
 * @param {string} service.bgColor - Background color class (e.g., "bg-blue-50")
 */
const ServiceCard = ({ service }) => {
  const Icon = service.icon;

  // Format price to currency
  const formattedPrice = service.serviceprice
    ? `Rs. ${service.serviceprice.toLocaleString()}`
    : "Contact for pricing";

  // Format time duration
  const formattedTime = service.servicetime
    ? `${service.servicetime} mins`
    : "Varies";

  return (
    <div className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 relative group">
      {service.popular && (
        <div className="absolute -top-3 right-6">
          <span
            className={`${COLORS.bg.brand} ${COLORS.text.inverse} text-xs font-bold px-3 py-1 rounded-full`}
          >
            POPULAR
          </span>
        </div>
      )}

      {service.has_offer && (
        <div className="absolute -top-3 left-6">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {service.offer_description || "Special Offer"}
          </span>
        </div>
      )}

      <div
        className={`inline-flex items-center justify-center w-14 h-14 ${service.bgColor || COLORS.bg.brandLight} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        {Icon && (
          <Icon className={`h-7 w-7 ${service.color || COLORS.icon.brand}`} />
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {service.servicename}
      </h3>

      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2 h-12">
        {service.short_description ||
          service.servicedetails ||
          "Professional service with attention to detail."}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex flex-col">
          {service.has_offer ? (
            <div>
              <span className="text-xs text-gray-400 line-through font-semibold mr-2">
                Rs. {service.serviceprice?.toLocaleString()}
              </span>
              <div className="text-lg font-bold text-red-600">
                Rs. {parseFloat(service.offer_price).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {service.is_variable_price && (
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-none mb-0.5">
                  Starts From
                </span>
              )}
              <span className="text-lg font-bold text-gray-900">
                {formattedPrice}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-500">
            Duration: {service.servicetime}
          </span>
        </div>
        <ArrowRight
          className={`h-5 w-5 ${COLORS.icon.brand} group-hover:translate-x-1 transition-transform duration-300`}
        />
      </div>
    </div>
  );
};

export default ServiceCard;
