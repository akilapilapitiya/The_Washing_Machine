import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

// Mock employees data; replace with API data later
const mockEmployees = [
  {
    id: "any",
    name: "Any Employee",
    role: "Auto-assign",
    experience: "We will assign the best available employee",
    isDefault: true,
  },
  {
    id: "1",
    name: "John Silva",
    role: "Senior Detailer",
    experience: "8 years experience",
    isDefault: false,
  },
  {
    id: "2",
    name: "Sarah Fernando",
    role: "Service Specialist",
    experience: "5 years experience",
    isDefault: false,
  },
  {
    id: "3",
    name: "Michael Perera",
    role: "Lead Technician",
    experience: "10 years experience",
    isDefault: false,
  },
  {
    id: "4",
    name: "Amara Jayasinghe",
    role: "Master Detailer",
    experience: "12 years experience",
    isDefault: false,
  },
];

const EmployeeSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("any");

  const { vehicleId, serviceIds, locationId } = location.state || {};

  const handleContinue = () => {
    // Navigate to datetime selection with all booking data
    navigate("/booking/datetime", {
      state: {
        vehicleId,
        serviceIds,
        locationId,
        employeeId: selectedEmployeeId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Book Service
          </p>
          <h1 className="text-3xl font-bold italic tracking-tight uppercase text-gray-900">
            Select preferred employee
          </h1>
          <p className="text-gray-600">
            Choose a specific employee or let us assign the best available.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockEmployees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => setSelectedEmployeeId(employee.id)}
              className="group text-left transition-all duration-300"
              aria-pressed={selectedEmployeeId === employee.id}
            >
              <Card
                className={cn(
                  "h-full border-2 transition-all duration-300",
                  selectedEmployeeId === employee.id
                    ? "border-red-600 shadow-md ring-1 ring-red-600"
                    : "border-transparent hover:border-red-200 bg-white shadow-sm",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-start gap-4 text-lg">
                    <span
                      className={cn(
                        "flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full text-white transition-colors shadow-sm",
                        selectedEmployeeId === employee.id
                          ? "bg-red-600"
                          : "bg-gray-900 group-hover:bg-red-600",
                      )}
                    >
                      {employee.isDefault ? (
                        <Users size={24} />
                      ) : (
                        <User size={24} />
                      )}
                    </span>
                    <div className="flex-1">
                      <div
                        className={cn(
                          "font-bold uppercase italic transition-colors",
                          selectedEmployeeId === employee.id
                            ? "text-red-600"
                            : "text-gray-900",
                        )}
                      >
                        {employee.name}
                      </div>
                      <div className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-tight">
                        {employee.role}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {employee.experience}
                  </p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-center pt-8 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="px-8 h-14 border-2 font-bold uppercase tracking-wide hover:bg-gray-100"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="px-10 h-14 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-xl shadow-red-200 transition-all duration-300"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectionPage;
