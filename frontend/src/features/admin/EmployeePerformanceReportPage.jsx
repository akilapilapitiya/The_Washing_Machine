import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Download,
  Calendar,
  Loader2,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
} from "lucide-react";
import * as reportService from "@/services/report.service";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import { format, startOfWeek, startOfMonth } from "date-fns";
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

  const fetchReport = React.useCallback(async () => {
    try {
      setLoading(true);
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
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const setQuickRange = (range) => {
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    
    if (range === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (range === "week") {
      const monday = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      setStartDate(monday);
      setEndDate(todayStr);
    } else if (range === "month") {
      const firstDayOfMonth = format(startOfMonth(now), "yyyy-MM-dd");
      setStartDate(firstDayOfMonth);
      setEndDate(todayStr);
    }
  };

  const handleDownload = React.useCallback(() => {
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
  }, [report, startDate, endDate]);

  // Calculate stats
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

  const maxDate = format(new Date(), "yyyy-MM-dd");

  // Memoize action element for stable reference
  // Memoize summary pills for the toolbar
  const summaryPills = React.useMemo(() => (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 border px-3 py-1.5 rounded-lg bg-white shadow-sm transition-all hover:border-yellow-100 group">
        <TrendingUp size={14} className="text-yellow-500" />
        <div className="flex flex-col max-w-[120px]">
          <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400 leading-none">MVP</span>
          <span className="text-xs font-bold text-gray-900 leading-none mt-0.5 truncate" title={topPerformer?.empname}>
            {topPerformer ? topPerformer.empname : "N/A"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 border px-3 py-1.5 rounded-lg bg-white shadow-sm transition-all hover:border-blue-100">
        <Briefcase size={14} className="text-blue-500" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400 leading-none">Total Jobs</span>
          <span className="text-xs font-bold text-gray-900 leading-none mt-0.5">{totalJobs}</span>
        </div>
      </div>
    </div>
  ), [topPerformer, totalJobs]);

  const toolbar = React.useMemo(() => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4">
        {summaryPills}
        <div className="h-8 w-px bg-gray-200 hidden md:block" />
        <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setQuickRange("today")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
              startDate === endDate && startDate === maxDate 
                ? "bg-white text-red-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setQuickRange("week")}
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-gray-500 hover:text-gray-900 transition-all"
          >
            This Week
          </button>
          <button 
            onClick={() => setQuickRange("month")}
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-gray-500 hover:text-gray-900 transition-all"
          >
            This Month
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm h-10 w-full md:w-auto">
        <div className="flex flex-col flex-1 md:flex-none">
          <label className="text-[9px] text-gray-400 px-2 font-black uppercase tracking-widest mb-0.5 leading-none">From</label>
          <input
            type="date"
            value={startDate}
            max={maxDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs font-bold bg-transparent px-2 focus:outline-none h-4"
          />
        </div>
        <div className="h-6 w-px bg-gray-200 shrink-0"></div>
        <div className="flex flex-col flex-1 md:flex-none">
          <label className="text-[9px] text-gray-400 px-2 font-black uppercase tracking-widest mb-0.5 leading-none">To</label>
          <input
            type="date"
            value={endDate}
            max={maxDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs font-bold bg-transparent px-2 focus:outline-none h-4"
          />
        </div>
      </div>
    </div>
  ), [startDate, endDate, maxDate, summaryPills]);

  const headerAction = React.useMemo(() => (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={report.length === 0}
      className="h-10 px-4 font-bold border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm"
    >
      <Download size={16} className="mr-2" />
      Export CSV
    </Button>
  ), [report.length, handleDownload]);

  useSetPageHeader(
    "Financial Reports",
    "Employee Performance",
    "Track staff productivity and revenue generation.",
    headerAction,
    toolbar,
  );

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{row.empname}</span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">{row.emptype}</span>
        </div>
      ),
    },
    {
      key: "jobs",
      label: "Workload",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{row.completed_jobs}</span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Jobs Completed</span>
        </div>
      ),
    },
    {
      key: "revenue",
      label: "Value Generated",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-black text-green-700">{formatCurrency(row.total_revenue)}</span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">
            Avg. Rs. {(parseFloat(row.total_revenue) / parseInt(row.completed_jobs)).toFixed(0)} / job
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-20">
      {/* Chart Section */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-600" />
            Revenue Leadership
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-red-600" size={32} />
            </div>
          ) : report.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 py-12">
              <Users size={32} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">No performance data available</p>
            </div>
          ) : (
            <div className="h-72 flex items-end justify-between gap-2 pt-12 pb-6 px-6 overflow-x-auto no-scrollbar bg-gradient-to-t from-gray-50/50 to-white">
              {report.slice(0, 10).map((item) => {
                const heightPercent =
                  (parseFloat(item.total_revenue || 0) / maxRevenue) * 100;
                return (
                  <div
                    key={item.empid}
                    className="flex flex-col items-center justify-end w-full min-w-[60px] group relative h-full"
                  >
                    <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 pointer-events-none whitespace-nowrap z-10 shadow-xl">
                      {item.empname}: {formatCurrency(item.total_revenue)}
                    </div>
                    <div
                      className="w-full max-w-16 bg-blue-100 group-hover:bg-blue-600 transition-all rounded-t-sm"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    ></div>
                    <div className="mt-3 text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate w-full text-center">
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
      <div className="space-y-4">
        {loading ? (
          <PageLoader message="Analyzing performance metrics..." />
        ) : (
          <DataTable
            columns={columns}
            data={report}
            keyField="empid"
            emptyIcon={Briefcase}
            emptyTitle="No data found"
            emptySubtitle="No staff activities recorded for this period."
          />
        )}
      </div>
    </div>
  );
};

export default EmployeePerformanceReportPage;
