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
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Book Service
          </p>
          <h1 className="text-3xl font-bold">Select preferred employee</h1>
          <p className="text-gray-600">
            Choose a specific employee or let us assign the best available.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockEmployees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => setSelectedEmployeeId(employee.id)}
              className="text-left"
              aria-pressed={selectedEmployeeId === employee.id}
            >
              <Card
                className={cn(
                  "h-full border transition hover:border-blue-400 hover:shadow-sm",
                  selectedEmployeeId === employee.id &&
                    "border-blue-500 shadow ring-2 ring-blue-500 ring-offset-0"
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-start gap-3 text-lg">
                    <span
                      className={cn(
                        "flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full text-white",
                        employee.isDefault ? "bg-gray-400" : "bg-blue-600"
                      )}
                    >
                      {employee.isDefault ? (
                        <Users size={20} />
                      ) : (
                        <User size={20} />
                      )}
                    </span>
                    <div className="flex-1">
                      <div>{employee.name}</div>
                      <div className="text-sm font-normal text-gray-600 mt-1">
                        {employee.role}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{employee.experience}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectionPage;
