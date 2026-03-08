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
  Loader2,
  CheckCircle,
  FileText,
} from "lucide-react";
import * as schedulerService from "@/services/scheduler.service";
import * as employeeService from "@/services/employee.service";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
const LeaveManagementPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    empid: "",
    startDate: "",
    endDate: "",
    reason: "",
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
    } catch (err) {
      toast.error("Failed to synchronize attendance registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await schedulerService.recordLeave(formData);
      toast.success("Leave recorded successfully.");
      setFormData({ empid: "", startDate: "", endDate: "", reason: "" });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Failed to record leave.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useSetPageHeader(
    "Human Resources",
    "Staff Attendance",
    "Manage operative availability and leave records.",
  );

  if (loading) return <PageLoader message="Loading attendance records..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Create Leave Form */}
          <Card className="lg:col-span-1 shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus size={18} />
                Record Time Off
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLeave} className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Employee
                  </Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.empid}
                    onChange={(e) =>
                      setFormData({ ...formData, empid: e.target.value })
                    }
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Start Date
                    </Label>
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
                  <div className="space-y-2">
                    <Label>
                      End Date
                    </Label>
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
                </div>

                <div className="space-y-2">
                  <Label>
                    Reason
                  </Label>
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

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Record Leave"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Leaves List */}
          <Card className="lg:col-span-2 shadow-sm border-gray-100">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText size={18} className="text-gray-400" />
                Active Leave Records
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {leaves.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {leaves.map((leave) => (
                    <div
                      key={leave.leaveid}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {leave.empname}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <CalendarIcon size={12} className="text-red-500" />
                            <span>
                              {new Date(
                                leave.leavestartdate,
                              ).toLocaleDateString()}
                            </span>
                            <span>→</span>
                            <span>
                              {new Date(
                                leave.leaveenddate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div className="hidden sm:block text-left">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Reason
                          </p>
                          <p className="text-sm text-gray-700">
                            {leave.leavereason}
                          </p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                          On Leave
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Briefcase size={48} className="mx-auto text-gray-200" />
                  <h3 className="font-medium text-lg text-gray-900">
                    No Active Leaves
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    No staff members are currently on leave. Good to go!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagementPage;
