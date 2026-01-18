import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ServiceCard = ({ service }) => {
  const formatPrice = (price) => {
    return typeof price === "number" ? `$${price.toFixed(2)}` : price;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    // If timeString is HH:MM format from database
    return timeString.substring(0, 5); // e.g., "01:30"
  };

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {service.servicename}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 line-clamp-2">{service.servicedetails}</p>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-blue-600">Starting at {formatPrice(service.serviceprice)}</span>
          <span className="text-gray-500">Approx. {formatTime(service.servicetime)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
