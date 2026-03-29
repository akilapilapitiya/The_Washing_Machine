import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as employeeService from "@/services/employee.service";
import * as bookingService from "@/services/booking.service";
import { toast } from "sonner";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import BookingFlowToolbar, {
  BookingToolbarBackButton,
  BookingToolbarActionButton,
} from "@/components/common/BookingFlowToolbar";

const EmployeeSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("any");
  const [resolvingEmployee, setResolvingEmployee] = useState(false);

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

  const selectedEmployeeName = useMemo(() => {
    if (selectedEmployeeId === "any") {
      return "Any available employee";
    }

    const selectedEmployee = employees.find(
      (employee) => employee.empid === selectedEmployeeId,
    );

    if (!selectedEmployee) return null;
    return (
      selectedEmployee.empname ||
      `${selectedEmployee.first_name || ""} ${selectedEmployee.last_name || ""}`.trim() ||
      null
    );
  }, [employees, selectedEmployeeId]);

  const handleContinue = useCallback(async () => {
    if (selectedEmployeeId !== "any") {
      navigate("/dashboard/booking/datetime", {
        state: {
          vehicleId,
          serviceIds,
          locationId,
          locationData,
          employeeId: selectedEmployeeId,
          employeeName: selectedEmployeeName,
        },
      });
      return;
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      toast.error("Select at least one service before assigning an employee.");
      return;
    }

    try {
      setResolvingEmployee(true);

      const assignment = await bookingService.resolveBookingEmployee({
        vehicleId,
        services: serviceIds,
        locationType: locationData?.type || "branch",
      });

      const resolvedEmployeeId = assignment?.employeeId;
      if (!resolvedEmployeeId) {
        toast.error("Unable to assign an employee right now.");
        return;
      }

      toast.success(
        `Assigned ${assignment?.employee?.name || `Employee #${resolvedEmployeeId}`}`,
      );

      navigate("/dashboard/booking/datetime", {
        state: {
          vehicleId,
          serviceIds,
          locationId,
          locationData,
          employeeId: resolvedEmployeeId,
          employeeName: assignment?.employee?.name || null,
          autoAssignedEmployee: assignment?.employee || null,
        },
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to auto-assign employee.",
      );
    } finally {
      setResolvingEmployee(false);
    }
  }, [
    selectedEmployeeId,
    selectedEmployeeName,
    serviceIds,
    vehicleId,
    locationId,
    locationData,
    navigate,
  ]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

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
      [row.empname, row.roleLabel, row.emptype].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [searchQuery, tableData]);

  const toolbar = useMemo(
    () => (
      <BookingFlowToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search employees..."
        meta={
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
            {employees.length} available
          </span>
        }
        rightSlot={
          <>
            <BookingToolbarBackButton onClick={handleBack} />
            <BookingToolbarActionButton
              onClick={handleContinue}
              disabled={resolvingEmployee}
            >
              {resolvingEmployee ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight size={14} className="ml-2" />
                </>
              )}
            </BookingToolbarActionButton>
          </>
        }
      />
    ),
    [
      employees.length,
      handleBack,
      handleContinue,
      searchQuery,
      resolvingEmployee,
    ],
  );

  useSetPageHeader(
    "BOOK SERVICE",
    "Select Employee",
    "Choose a preferred employee or let us assign the best available.",
    null,
    toolbar,
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
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        Role
                      </th>
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
                              <span className="font-semibold text-gray-900">
                                {row.empname}
                              </span>
                              {row.empid !== "any" && (
                                <span className="text-[11px] text-gray-400">
                                  ID: {row.empid}
                                </span>
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
              <p className="text-gray-500 text-sm">
                No employees match your search.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployeeSelectionPage;
