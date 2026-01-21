import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const VehicleCard = ({ vehicle, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(vehicle.id)}
      className="text-left group transition-all duration-300 transform hover:-translate-y-1"
      aria-pressed={selected}
    >
      <Card
        className={cn(
          "h-full border-2 transition-all duration-300 relative overflow-hidden",
          selected
            ? "border-red-600 shadow-lg shadow-red-200 ring-1 ring-red-600"
            : "border-transparent bg-white shadow-sm hover:border-red-200",
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-col gap-1">
            <span
              className={cn(
                "text-lg font-black uppercase italic tracking-tight transition-colors",
                selected
                  ? "text-red-600"
                  : "text-gray-900 group-hover:text-red-600",
              )}
            >
              {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
            </span>
            <span className="text-xs font-mono font-bold text-gray-400 tracking-widest">
              {vehicle.plate}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[11px] uppercase font-bold tracking-wider text-gray-500">
          <div className="flex justify-between border-b border-gray-50 pb-1">
            <span>Make</span>
            <span className="text-gray-900">{vehicle.make}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-1">
            <span>Model</span>
            <span className="text-gray-900">{vehicle.model}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span>Identity</span>
            <span className="text-red-600 font-mono">{vehicle.plate}</span>
          </div>
        </CardContent>
        {selected && (
          <div className="absolute top-0 right-0 h-6 w-6 bg-red-600 flex items-center justify-center rounded-bl-lg">
            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
          </div>
        )}
      </Card>
    </button>
  );
};

export default VehicleCard;
