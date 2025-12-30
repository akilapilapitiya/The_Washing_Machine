import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const VehicleCard = ({ vehicle, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(vehicle.id)}
      className="text-left"
      aria-pressed={selected}
    >
      <Card
        className={cn(
          "h-full border transition hover:border-blue-400 hover:shadow-sm",
          selected && "border-blue-500 shadow"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>
              {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
            </span>
            <span className="text-sm text-gray-500">{vehicle.plate}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Make</span>
            <span className="font-medium text-gray-800">{vehicle.make}</span>
          </div>
          <div className="flex justify-between">
            <span>Model</span>
            <span className="font-medium text-gray-800">{vehicle.model}</span>
          </div>
          <div className="flex justify-between">
            <span>Year</span>
            <span className="font-medium text-gray-800">{vehicle.year}</span>
          </div>
          <div className="flex justify-between">
            <span>Color</span>
            <span className="font-medium text-gray-800">{vehicle.color}</span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
};

export default VehicleCard;
