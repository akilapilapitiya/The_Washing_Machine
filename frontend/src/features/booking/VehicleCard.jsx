import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const VehicleCard = ({ vehicle, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(vehicle.id)}
      className="text-left group transition-all duration-200 w-full"
      aria-pressed={selected}
    >
      <Card
        className={cn(
          "h-full border transition-all duration-200 relative overflow-hidden active:scale-95",
          selected
            ? "border-red-600 shadow-md ring-1 ring-red-600 bg-red-50/10"
            : "border-gray-200 bg-white shadow-sm hover:border-red-300 hover:shadow-md",
        )}
      >
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="flex justify-between items-start">
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-base font-bold transition-colors",
                  selected ? "text-red-700" : "text-gray-900",
                )}
              >
                {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
              </span>
              <span className="text-xs font-medium text-gray-500 mt-0.5">
                {vehicle.make} {vehicle.model}
              </span>
            </div>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded font-medium",
                selected
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              {vehicle.plate}
            </span>
          </CardTitle>
        </CardHeader>
        {selected && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
        )}
      </Card>
    </button>
  );
};

export default VehicleCard;
