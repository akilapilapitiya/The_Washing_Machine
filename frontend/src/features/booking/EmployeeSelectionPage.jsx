import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import * as employeeService from "@/services/employee.service";

import { toast } from "sonner";
const roleLabels = {
  junior: "Frontline Detailer",
  mid: "Service Specialist",
  senior: "Senior Technician",
  lead: "Floor Manager",
  master: "Master Detailer",
};

const experienceLabels = {
  junior: "Entry-level specialist with keen attention to detail.",
  mid: "5+ years experience in precision vehicle care.",
  senior: "8+ years experience in advanced surface correction.",
  lead: "10+ years experience, overseeing operational excellence.",
  master: "12+ years experience. The pinnacle of automotive detailing.",
};

const EmployeeSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("any");

  const { vehicleId, serviceIds, locationId } = location.state || {};

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await employeeService.getEmployees();
        // Filter out owners as per user request
        const filtered = data.filter((emp) => emp.emptype !== "owner");
        setEmployees(filtered);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        toast.error("Failed to load employee list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleContinue = () => {
    // Navigate to datetime selection with all booking data
    navigate("/dashboard/booking/datetime", {
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Select preferred employee
          </h1>
          <p className="text-gray-600">
            Choose a specific employee or let us assign the best available.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest">
              Syncing Operatives...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-100 rounded-xl p-8 flex flex-col items-center text-center gap-4">
            <AlertCircle size={40} className="text-red-600" />
            <div className="space-y-1">
              <p className="text-red-800 font-bold tracking-tight">
                System Fault
              </p>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-bold"
            >
              Retry Mission
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Auto-assign Option */}
            <button
              onClick={() => setSelectedEmployeeId("any")}
              className="group text-left transition-all duration-300"
              aria-pressed={selectedEmployeeId === "any"}
            >
              <Card
                className={cn(
                  "h-full border-2 transition-all duration-300",
                  selectedEmployeeId === "any"
                    ? "border-red-600 shadow-md ring-1 ring-red-600"
                    : "border-transparent hover:border-red-200 bg-white shadow-sm",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-start gap-4 text-lg">
                    <span
                      className={cn(
                        "flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full text-white transition-colors shadow-sm",
                        selectedEmployeeId === "any"
                          ? "bg-red-600"
                          : "bg-gray-900 group-hover:bg-red-600",
                      )}
                    >
                      <Users size={24} />
                    </span>
                    <div className="flex-1">
                      <div
                        className={cn(
                          "font-bold transition-colors",
                          selectedEmployeeId === "any"
                            ? "text-red-600"
                            : "text-gray-900",
                        )}
                      >
                        Any Employee
                      </div>
                      <div className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-tight">
                        Auto-assign
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We will assign the best available operative for your
                    vehicle.
                  </p>
                </CardContent>
              </Card>
            </button>

            {/* Real Employees */}
            {employees.map((employee) => (
              <button
                key={employee.empid}
                type="button"
                onClick={() => setSelectedEmployeeId(employee.empid)}
                className="group text-left transition-all duration-300"
                aria-pressed={selectedEmployeeId === employee.empid}
              >
                <Card
                  className={cn(
                    "h-full border-2 transition-all duration-300",
                    selectedEmployeeId === employee.empid
                      ? "border-red-600 shadow-md ring-1 ring-red-600"
                      : "border-transparent hover:border-red-200 bg-white shadow-sm",
                  )}
                >
                  <CardHeader>
                    <CardTitle className="flex items-start gap-4 text-lg">
                      <span
                        className={cn(
                          "flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full text-white transition-colors shadow-sm",
                          selectedEmployeeId === employee.empid
                            ? "bg-red-600"
                            : "bg-gray-900 group-hover:bg-red-600",
                        )}
                      >
                        <User size={24} />
                      </span>
                      <div className="flex-1">
                        <div
                          className={cn(
                            "font-bold transition-colors",
                            selectedEmployeeId === employee.empid
                              ? "text-red-600"
                              : "text-gray-900",
                          )}
                        >
                          {employee.empname}
                        </div>
                        <div className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-tight">
                          {roleLabels[employee.emptype] || "Service Operative"}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {experienceLabels[employee.emptype] ||
                        "Highly trained operative dedicated to premium service."}
                    </p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}

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
            className="px-10 h-14 bg-red-600 hover:bg-black text-white font-bold tracking-widest shadow-xl shadow-red-200 transition-all duration-300"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectionPage;
