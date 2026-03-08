import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Download,
  Calendar,
  Loader2,
  TrendingUp,
  DollarSign
} from "lucide-react";
import * as reportService from "@/services/report.service";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
const DailyIncomeReportPage = () => {
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
      const data = await reportService.getDailyIncomeReport(startDate, endDate);
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
    const headers = ["Date", "Transactions", "Total Income (Rs)"];
    const rows = report.map((r) => [
      r.date,
      r.transaction_count,
      r.total_income,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-report-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats
  const totalRevenue = report.reduce(
    (sum, r) => sum + parseFloat(r.total_income || 0),
    0,
  );
  const totalTx = report.reduce(
    (sum, r) => sum + parseInt(r.transaction_count || 0),
    0,
  );
  const maxIncome = Math.max(
    ...report.map((r) => parseFloat(r.total_income || 0)),
    100,
  ); // Avoid div by zero

  const formatCurrency = (val) => `Rs. ${val.toLocaleString()}`;

  useSetPageHeader(
    "Financial Reports",
    "Daily Income Report",
    "Track revenue and transaction volume over time.",
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm h-10">
      <div className="flex flex-col">
        <label className="text-[10px] text-gray-400 px-2 font-medium uppercase tracking-wider mb-0.5" style={{ lineHeight: 1 }}>From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="text-xs font-medium bg-transparent px-2 focus:outline-none h-4"
        />
      </div>
      <div className="h-6 w-px bg-gray-200"></div>
      <div className="flex flex-col">
        <label className="text-[10px] text-gray-400 px-2 font-medium uppercase tracking-wider mb-0.5" style={{ lineHeight: 1 }}>To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="text-xs font-medium bg-transparent px-2 focus:outline-none h-4"
        />
      </div>
    </div>
  );

  return (
          <div className="mx-auto w-full max-w-7xl space-y-4">
        <div className="flex justify-end mb-4">
          {/* Mobile view calendar button */}
          <Button
            onClick={fetchReport}
            size="sm"
            className="md:hidden bg-gray-900 hover:bg-gray-800"
          >
            <Calendar size={14} className="mr-2" /> View Date Range
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                    Total Revenue
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(totalRevenue)}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <DollarSign />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                    Transactions
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {totalTx}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <TrendingUp />
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
            <CardTitle>Income Trend</CardTitle>
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
              <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 px-2 overflow-x-auto">
                {report.map((item) => {
                  const heightPercent =
                    (parseFloat(item.total_income) / maxIncome) * 100;
                  return (
                    <div
                      key={item.date}
                      className="flex flex-col items-center justify-end w-full min-w-[40px] group relative h-full"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                        {item.date}: {formatCurrency(item.total_income)}
                      </div>

                      {/* Bar */}
                      <div
                        className="w-full bg-red-100 group-hover:bg-red-600 transition-colors rounded-t-sm"
                        style={{ height: `${heightPercent}%` }}
                      ></div>

                      {/* Label */}
                      <div className="mt-2 text-[10px] text-gray-500 transform -rotate-45 origin-top-left translate-y-4 whitespace-nowrap">
                        {item.date.slice(5)}
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
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Transactions</th>
                    <th className="px-4 py-3 text-right">Income</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">
                      Avg. Ticket
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.map((item) => (
                    <tr key={item.date} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.date}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {item.transaction_count}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {formatCurrency(item.total_income)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">
                        {formatCurrency(
                          parseFloat(item.total_income) /
                          parseInt(item.transaction_count),
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  {!loading && report.length > 0 && (
                    <tr className="bg-gray-50 font-bold">
                      <td className="px-4 py-3">TOTAL</td>
                      <td className="px-4 py-3 text-right">{totalTx}</td>
                      <td className="px-4 py-3 text-right text-green-700">
                        {formatCurrency(totalRevenue)}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
};

export default DailyIncomeReportPage;
