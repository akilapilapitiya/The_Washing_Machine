import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  User,
  Briefcase,
  Trash2,
  Plus,
  X,
  Loader2,
  CheckCircle,
  FileText,
} from "lucide-react";
import * as schedulerService from "@/services/scheduler.service";
import * as employeeService from "@/services/employee.service";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import BookingFlowToolbar from "@/components/common/BookingFlowToolbar";
import { intervalMatchesQuickDateRange } from "@/utils/quickDateRange";
const LeaveManagementPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dateRange, setDateRange] = useState("all");

  const [isPartialDay, setIsPartialDay] = useState(false);
  const [formData, setFormData] = useState({
    empid: "",
    startDate: "",
    endDate: "",
    reason: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesData, empsData] = await Promise.all([
        schedulerService.getAllLeaves(),
        employeeService.getEmployees(),
      ]);
      setLeaves(leavesData || []);
      setEmployees(empsData.filter((e) => e.emptype !== "owner") || []);
    } catch {
      toast.error("Failed to synchronize attendance registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (!isPartialDay) {
        delete payload.startTime;
        delete payload.endTime;
      } else {
        payload.endDate = payload.startDate; // Partial leave is always single day
      }
      await schedulerService.recordLeave(payload);
      toast.success("Leave recorded successfully.");
      setFormData({
        empid: "",
        startDate: "",
        endDate: "",
        reason: "",
        startTime: "",
        endTime: "",
      });
      setIsPartialDay(false);
      fetchData();
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record leave.");
    } finally {
      setSubmitting(false);
    }
  };

  // Memoize action button for stable reference
  const headerAction = React.useMemo(
    () => (
      <Button
        onClick={() => setShowAddForm(true)}
        className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wide rounded-lg shadow-sm"
      >
        <Plus size={16} className="mr-2" />
        Record Leave
      </Button>
    ),
    [],
  );

  const filteredLeaves = leaves.filter((leave) => {
    const matchesDate = intervalMatchesQuickDateRange(
      leave.leavestartdate,
      leave.leaveenddate,
      dateRange,
    );
    return matchesDate;
  });

  const toolbarTabs = React.useMemo(
    () => [
      { id: "all", label: "All" },
      { id: "today", label: "Today" },
      { id: "month", label: "This Month" },
    ],
    [],
  );

  const toolbar = React.useMemo(
    () => (
      <BookingFlowToolbar
        tabs={toolbarTabs}
        activeTab={dateRange}
        onTabChange={setDateRange}
        tabsAriaLabel="Leave date filters"
        meta={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-gray-200">
              <Briefcase size={13} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-500">
                Records
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {leaves.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-gray-200">
              <CalendarIcon size={13} className="text-red-500" />
              <span className="text-xs font-semibold text-gray-500">Today</span>
              <span className="text-xs font-semibold text-gray-900">
                {
                  leaves.filter((leave) =>
                    intervalMatchesQuickDateRange(
                      leave.leavestartdate,
                      leave.leaveenddate,
                      "today",
                    ),
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-gray-200">
              <CalendarIcon size={13} className="text-orange-500" />
              <span className="text-xs font-semibold text-gray-500">
                This Month
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {
                  leaves.filter((leave) =>
                    intervalMatchesQuickDateRange(
                      leave.leavestartdate,
                      leave.leaveenddate,
                      "month",
                    ),
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-gray-200">
              <User size={13} className="text-blue-500" />
              <span className="text-xs font-semibold text-gray-500">
                Staff Affected
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {new Set(leaves.map((leave) => leave.empid)).size}
              </span>
            </div>
          </div>
        }
      />
    ),
    [dateRange, leaves, toolbarTabs],
  );

  useSetPageHeader(
    "Human Resources",
    "Staff Attendance",
    "Manage operative availability and leave records.",
    headerAction,
    toolbar,
  );

  if (loading) return <PageLoader message="Loading attendance records..." />;

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
            <User size={18} />
          </div>
          <span className="font-medium text-gray-900">{row.empname}</span>
        </div>
      ),
    },
    {
      key: "period",
      label: "Leave Period",
      render: (row) => (
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <CalendarIcon size={12} className="text-red-500" />
          <span>{new Date(row.leavestartdate).toLocaleDateString()}</span>
          <span>→</span>
          <span>{new Date(row.leaveenddate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (row) => (
        <p className="text-sm text-gray-700 line-clamp-1">{row.leavereason}</p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: () => (
        <div className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium w-fit">
          On Leave
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Create Leave Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="bg-white border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Plus size={20} />
                  Record Time Off
                </CardTitle>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateLeave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.empid}
                    onChange={(e) =>
                      setFormData({ ...formData, empid: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select Staff Member
                    </option>
                    {employees.map((emp) => (
                      <option key={emp.empid} value={emp.empid?.toString()}>
                        {emp.empname} ({emp.emptype})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPartialDay"
                    checked={isPartialDay}
                    onChange={(e) => setIsPartialDay(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer"
                  />
                  <Label
                    htmlFor="isPartialDay"
                    className="cursor-pointer text-sm"
                  >
                    Partial Day Leave (Specific Hours)
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isPartialDay ? "Date" : "Start Date"}</Label>
                    <Input
                      type="date"
                      className="border-gray-200"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  {!isPartialDay && (
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        className="border-gray-200"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        required
                      />
                    </div>
                  )}
                </div>

                {isPartialDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        className="border-gray-200"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        required={isPartialDay}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        className="border-gray-200"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        required={isPartialDay}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input
                    placeholder="Reason for absence..."
                    className="border-gray-200"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Record Leave"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredLeaves}
        keyField="leaveid"
        emptyIcon={Briefcase}
        emptyTitle="No Active Leaves"
        emptySubtitle="No staff members are currently on leave. Operations are running at full capacity."
      />
    </div>
  );
};

export default LeaveManagementPage;
