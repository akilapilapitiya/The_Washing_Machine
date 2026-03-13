import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Loader2, AlertCircle, ArrowRight, Search, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as employeeService from "@/services/employee.service";
import { toast } from "sonner";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

const EmployeeSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("any");

  const { vehicleId, serviceIds, locationId, locationData } =
    location.state || {};

  useEffect(() => {
    if (!vehicleId) {
      navigate("/dashboard/book");
      return;
    }

    const fetchBookingData = async () => {
      try {
        setLoading(true);
        setError(null);
        const employeesData = await employeeService.getEmployees();

        // Filter out non-service staff as per user request
        const filtered = employeesData.filter(
          (emp) =>
            emp.emptype !== "owner" &&
            emp.emptype !== "cashier" &&
            emp.emptype !== "manager",
        );
        setEmployees(filtered);
      } catch (err) {
        console.error("Failed to fetch booking data:", err);
        setError("Failed to load booking data. Please try again.");
        toast.error("Failed to load booking data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [vehicleId, navigate]);

  const handleContinue = useCallback(() => {
    navigate("/dashboard/booking/datetime", {
      state: {
        vehicleId,
        serviceIds,
        locationId,
        locationData,
        employeeId: selectedEmployeeId,
      },
    });
  }, [navigate, vehicleId, serviceIds, locationId, locationData, selectedEmployeeId]);

  const tableData = useMemo(() => {
    const directoryRows = employees.map((employee) => ({
      ...employee,
      roleLabel: employee.speciality || employee.emptype || "-",
      isAutoAssign: false,
    }));

    return [
      {
        empid: "any",
        empname: "Any Employee",
        emptype: "auto_assign",
        roleLabel: "Auto-assign",
        isAutoAssign: true,
      },
      ...directoryRows,
    ];
  }, [employees]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tableData;

    return tableData.filter((row) =>
      [row.empname, row.roleLabel, row.emptype].some(
        (value) => String(value || "").toLowerCase().includes(query),
      ),
    );
  }, [searchQuery, tableData]);

  const toolbar = useMemo(
    () => (
      <div className="flex items-center justify-between gap-3 w-full flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-fit">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-8 h-9 text-sm bg-white border-gray-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            )}
          </div>
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
            {employees.length} available
          </span>
        </div>

        <Button
          onClick={handleContinue}
          className="px-6 h-9 bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-sm transition-all duration-200 flex-shrink-0 whitespace-nowrap"
        >
          <span>Next</span>
          <ArrowRight size={14} className="ml-2" />
        </Button>
      </div>
    ),
    [employees.length, handleContinue, searchQuery],
  );

  useSetPageHeader(
    "BOOK SERVICE",
    "Select Employee",
    "Choose a preferred employee or let us assign the best available.",
    null,
    toolbar
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
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
        ) : filteredRows.length > 0 ? (
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left w-8"></th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Employee</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const isSelected = selectedEmployeeId === row.empid;

                      return (
                        <tr
                          key={row.empid}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedEmployeeId(row.empid)}
                        >
                          <td className="px-4 py-3 w-8">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => setSelectedEmployeeId(row.empid)}
                              className="w-4 h-4 text-red-600 cursor-pointer accent-red-600"
                              aria-label={`Select ${row.empname}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-gray-900">{row.empname}</span>
                              {row.empid !== "any" && (
                                <span className="text-[11px] text-gray-400">ID: {row.empid}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded uppercase">
                              {String(row.roleLabel || "-")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No employees match your search.</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default EmployeeSelectionPage;
