import React, { useState } from "react";
import { X, Clock, CheckCircle, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGE_BASE_URL } from "@/configs/env";
import { Link } from "react-router-dom";

const ServiceDetailsModal = ({ service, onClose }) => {
  const [activeImage, setActiveImage] = useState(
    service?.image_url ? `${IMAGE_BASE_URL}${service.image_url}` : null,
  );

  if (!service) return null;

  // Combine primary image and gallery for the slider/selector
  const allImages = [
    ...(service.image_url ? [service.image_url] : []),
    ...(service.gallery_urls || []),
  ].map((url) => (url.startsWith("http") ? url : `${IMAGE_BASE_URL}${url}`));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg backdrop-blur text-gray-500 hover:text-gray-900 transition-all"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 flex flex-col">
          <div className="flex-1 relative min-h-[300px] md:min-h-full">
            {activeImage ? (
              <img loading="lazy"
                src={activeImage}
                alt={service.servicename}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                No Image Available
              </div>
            )}

            {service.has_offer && (
              <div className="absolute top-6 left-6">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Tag size={12} />{" "}
                  {service.offer_description || "Special Offer"}
                </span>
              </div>
            )}
          </div>

          {/* Gallery Thumbs */}
          {allImages.length > 1 && (
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? "border-red-600 ring-1 ring-red-600" : "border-transparent hover:border-gray-300"}`}
                >
                  <img loading="lazy"
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 flex flex-col max-h-[60vh] md:max-h-[90vh]">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {service.category && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    {service.category}
                  </span>
                )}
                {service.servicetype === "addon" && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    Add-on
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                {service.servicename}
              </h2>
            </div>

            {/* Price & Duration */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div>
                {service.has_offer ? (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400 line-through font-medium">
                      Rs. {service.serviceprice?.toLocaleString()}
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      Rs. {service.offer_price?.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {service.is_variable_price && (
                      <span className="text-xs text-gray-500 font-bold uppercase">
                        Starts From
                      </span>
                    )}
                    <span className="text-2xl font-bold text-gray-900">
                      Rs. {service.serviceprice?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                <Clock size={20} />
                <span className="font-medium">{service.servicetime} mins</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                About this Service
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.long_description || service.servicedetails}
              </p>
            </div>

            {/* Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  What's Included
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle
                        size={16}
                        className="text-green-500 mt-0.5 shrink-0"
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer / CTA */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <Link to="/booking" onClick={onClose} className="block w-full">
              <Button
                size="lg"
                className="w-full text-base bg-red-600 hover:bg-red-700 h-12 shadow-lg hover:shadow-xl transition-all"
              >
                Book Service Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
