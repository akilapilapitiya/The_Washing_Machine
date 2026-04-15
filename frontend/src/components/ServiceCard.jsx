import React from "react";
import { ArrowUpRight, Clock3, Tag } from "lucide-react";
import { COLORS } from "@/lib/colors";
import { IMAGE_BASE_URL } from "@/configs/env";
import { Button } from "@/components/ui/button";

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
const ServiceCard = ({ service, onReadMore }) => {
  const Icon = service.icon;

  const toCurrency = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return "Contact for pricing";
    return `Rs. ${numericValue.toLocaleString()}`;
  };

  const toDuration = (value) => {
    if (!value) return "Flexible duration";
    if (typeof value === "number") return `${value} mins`;

    const [hoursRaw, minutesRaw] = String(value).split(":");
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return `${value}`;
    }

    if (hours === 0) return `${minutes} mins`;
    if (minutes === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
    return `${hours} hr ${minutes} mins`;
  };

  const basePrice = Number(service.serviceprice);
  const offerPrice = Number(service.offer_price);
  const hasOffer =
    Boolean(service.has_offer) &&
    Number.isFinite(offerPrice) &&
    offerPrice > 0 &&
    Number.isFinite(basePrice);

  const savingsPercent =
    hasOffer && basePrice > offerPrice
      ? Math.round(((basePrice - offerPrice) / basePrice) * 100)
      : null;

  const offerEndsText = service.offer_end_date
    ? new Date(service.offer_end_date).toLocaleDateString()
    : null;

  return (
    <article className="group flex flex-col relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-red-200">
      {service.popular && (
        <div className="absolute top-4 right-4 z-20">
          <span className="bg-gray-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase shadow-sm">
            POPULAR
          </span>
        </div>
      )}

      {hasOffer && (
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
            <Tag size={11} />
            {service.offer_description || "Special Offer"}
          </span>
          {savingsPercent ? (
            <span className="inline-flex items-center bg-white text-red-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-red-100 shadow-sm">
              Save {savingsPercent}%
            </span>
          ) : null}
        </div>
      )}

      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        {service.image_url ? (
          <img
            src={`${IMAGE_BASE_URL}${service.image_url}`}
            alt={service.servicename}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-gray-100">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 ${service.bgColor || COLORS.bg.brandLight} rounded-full shadow-inner transition-transform duration-300 group-hover:scale-110`}
            >
              {Icon && (
                <Icon
                  className={`h-9 w-9 ${service.color || COLORS.icon.brand}`}
                />
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 text-[11px] font-medium border border-white/20">
            <Clock3 size={12} />
            {toDuration(service.servicetime)}
          </span>
          {service.category ? (
            <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border border-white/20">
              {service.category}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 space-y-4">
        <div className="space-y-2 flex-1">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {service.servicename}
          </h3>

          <p className="text-gray-600 leading-relaxed line-clamp-2 text-sm">
            {service.short_description ||
              service.servicedetails ||
              "Professional care crafted for long-lasting shine and protection."}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-gray-100 pt-4 mt-auto">
          <div className="flex flex-col gap-1">
            {hasOffer ? (
              <>
                <span className="text-xs text-gray-400 line-through font-medium">
                  {toCurrency(basePrice)}
                </span>
                <span className="text-2xl font-bold text-red-600 leading-none">
                  {toCurrency(offerPrice)}
                </span>
                {offerEndsText ? (
                  <span className="text-[11px] text-gray-500 font-medium">
                    Offer ends {offerEndsText}
                  </span>
                ) : null}
              </>
            ) : (
              <>
                {service.is_variable_price ? (
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide leading-none">
                    Starts From
                  </span>
                ) : null}
                <span className="text-2xl font-bold text-gray-900 leading-none">
                  {toCurrency(basePrice)}
                </span>
              </>
            )}
          </div>

          {onReadMore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onReadMore(service);
              }}
              className="rounded-full px-4 h-9 text-xs font-semibold text-gray-700 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
            >
              Details
              <ArrowUpRight size={14} className="ml-1" />
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
