import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Download,
  Calendar,
  Loader2,
  TrendingUp,
  DollarSign
  Users,
  Briefcase} from "lucide-react";
import * as reportService from "@/services/report.service";

import { toast } from "sonner";
const EmployeePerformanceReportPage = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(
    firstDay.toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      toast.error(null);
      const data = await reportService.getEmployeePerformanceReport(
        startDate,
        endDate,
      );
      setReport(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report.length) return;

    // Convert to CSV
    const headers = [
      "Employee Name",
      "Role",
      "Completed Jobs",
      "Total Revenue (Rs)",
    ];
    const rows = report.map((r) => [
      r.empname,
      r.emptype,
      r.completed_jobs,
      r.total_revenue,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employee-performance-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats
  const totalRevenue = report.reduce(
    (sum, r) => sum + parseFloat(r.total_revenue || 0),
    0,
  );
  const totalJobs = report.reduce(
    (sum, r) => sum + parseInt(r.completed_jobs || 0),
    0,
  );
  const topPerformer = report.length > 0 ? report[0] : null;

  const maxRevenue = Math.max(
    ...report.map((r) => parseFloat(r.total_revenue || 0)),
    100,
  );

  const formatCurrency = (val) => `Rs. ${parseFloat(val).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
              Financial Reports
            </p>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="text-gray-900" />
              Employee Performance
            </h1>
            <p className="text-gray-600">
              Track staff productivity and revenue generation.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 px-2">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm font-medium bg-transparent px-2 focus:outline-none"
              />
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 px-2">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm font-medium bg-transparent px-2 focus:outline-none"
              />
            </div>
            <Button
              onClick={fetchReport}
              size="sm"
              className="ml-2 bg-gray-900 hover:bg-gray-800"
            >
              <Calendar size={14} />
            </Button>
          </div>
        </div>

{/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                    Top Performer
                  </p>
                  <h3
                    className="text-xl font-bold text-gray-900 mt-1 truncate max-w-[150px]"
                    title={topPerformer?.empname}
                  >
                    {topPerformer ? topPerformer.empname : "N/A"}
                  </h3>
                  {topPerformer && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(topPerformer.total_revenue)} generated
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <TrendingUp />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                    Total Jobs
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {totalJobs}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">across all staff</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Briefcase />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex items-center justify-center bg-gray-50 border-dashed shadow-none">
            <CardContent className="p-0">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={report.length === 0}
                className="gap-2 border-gray-300"
              >
                <Download size={16} />
                Download CSV Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
              </div>
            ) : report.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data for selected period
              </div>
            ) : (
              <div className="h-64 flex items-end justify-between gap-4 pt-8 pb-2 px-2 overflow-x-auto">
                {report.slice(0, 10).map((item) => {
                  const heightPercent =
                    (parseFloat(item.total_revenue || 0) / maxRevenue) * 100;
                  return (
                    <div
                      key={item.empid}
                      className="flex flex-col items-center justify-end w-full min-w-[60px] group relative h-full"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                        {item.empname}: {formatCurrency(item.total_revenue)}
                      </div>

                      {/* Bar */}
                      <div
                        className="w-full bg-blue-100 group-hover:bg-blue-600 transition-colors rounded-t-sm"
                        style={{ height: `${heightPercent}%` }}
                      ></div>

                      {/* Label */}
                      <div className="mt-2 text-[10px] text-gray-500 transform -rotate-45 origin-top-left translate-y-4 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        {item.empname.split(" ")[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Role</th>
                    <th className="px-4 py-3 text-right">Completed Jobs</th>
                    <th className="px-4 py-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.map((item) => (
                    <tr key={item.empid} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.empname}
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize hidden sm:table-cell">
                        {item.emptype}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {item.completed_jobs}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {formatCurrency(item.total_revenue)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  {!loading && report.length > 0 && (
                    <tr className="bg-gray-50 font-bold">
                      <td className="px-4 py-3">TOTAL</td>
                      <td className="px-4 py-3 hidden sm:table-cell"></td>
                      <td className="px-4 py-3 text-right">{totalJobs}</td>
                      <td className="px-4 py-3 text-right text-green-700">
                        {formatCurrency(totalRevenue)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeePerformanceReportPage;
