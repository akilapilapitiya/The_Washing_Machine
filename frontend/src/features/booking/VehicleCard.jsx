import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

const VehicleCard = ({ vehicle, selected, onSelect }) => {
  const [showInfo, setShowInfo] = useState(false);

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
        <CardHeader className="pb-2 pt-3 px-3">
          {/* Decorative Color Ribbon */}
          {vehicle.vehcolor && (
            <div
              className="absolute top-0 right-0 w-6 h-6 pointer-events-none z-10"
              style={{
                background: `linear-gradient(225deg, ${vehicle.vehcolor} 50%, transparent 50%)`,
                opacity: 0.8,
              }}
            />
          )}
          <CardTitle className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-sm font-bold transition-colors truncate",
                    selected ? "text-red-700" : "text-gray-900",
                  )}
                  title={vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                >
                  {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-gray-500 mt-0.5">
                {vehicle.plate}
              </span>
            </div>
            {/* Info Icon - Click to show details */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
                className={cn(
                  "p-1 rounded transition-colors",
                  selected
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
                aria-label="View vehicle details"
              >
                <Info size={14} />
              </button>

              {/* Info Popover */}
              {showInfo && (
                <div
                  className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 space-y-1.5">
                    {vehicle.year && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 min-w-fit">
                          Year:
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          {vehicle.year}
                        </span>
                      </div>
                    )}
                    {vehicle.fuel_type && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 min-w-fit">
                          Fuel:
                        </span>
                        <span className="text-xs font-semibold text-gray-900 uppercase">
                          {vehicle.fuel_type}
                        </span>
                      </div>
                    )}
                    {vehicle.transmission && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 min-w-fit">
                          Trans:
                        </span>
                        <span className="text-xs font-semibold text-gray-900 uppercase">
                          {vehicle.transmission}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2" />
        {selected && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
        )}
      </Card>
    </button>
  );
};

export default VehicleCard;
