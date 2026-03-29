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
} from "lucide-react";
import * as reportService from "@/services/report.service";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import { format } from "date-fns";
import DataTable from "@/components/common/DataTable";
import PageToolbar from "@/components/common/PageToolbar";
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

  const fetchReport = React.useCallback(async () => {
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
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDownload = React.useCallback(() => {
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
  }, [report, startDate, endDate]);

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

  const maxDate = format(new Date(), "yyyy-MM-dd");

  const toolbar = React.useMemo(
    () => (
      <PageToolbar
        stats={[
          {
            icon: DollarSign,
            label: "Revenue",
            value: formatCurrency(totalRevenue),
            iconClassName: "text-green-500",
          },
          {
            icon: TrendingUp,
            label: "Transactions",
            value: totalTx,
            iconClassName: "text-blue-500",
          },
        ]}
        rightSlot={
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm h-10 w-full md:w-auto">
            <div className="flex flex-col flex-1 md:flex-none">
              <label className="text-[9px] text-gray-400 px-2 font-black uppercase tracking-widest mb-0.5 leading-none">
                From
              </label>
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
              <label className="text-[9px] text-gray-400 px-2 font-black uppercase tracking-widest mb-0.5 leading-none">
                To
              </label>
              <input
                type="date"
                value={endDate}
                max={maxDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-bold bg-transparent px-2 focus:outline-none h-4"
              />
            </div>
          </div>
        }
      />
    ),
    [endDate, maxDate, startDate, totalRevenue, totalTx],
  );

  const headerAction = React.useMemo(
    () => (
      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={report.length === 0}
        className="h-10 px-4 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm text-xs font-semibold uppercase tracking-wide"
      >
        <Download size={16} className="mr-2" />
        Export CSV
      </Button>
    ),
    [report.length, handleDownload],
  );

  useSetPageHeader(
    "Financial Reports",
    "Daily Income Report",
    "Track revenue and transaction volume over time.",
    headerAction,
    toolbar,
  );

  const columns = [
    {
      key: "date",
      label: "Reporting Date",
      render: (row) => (
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <Calendar size={14} className="text-gray-400" />
          {row.date}
        </div>
      ),
    },
    {
      key: "transactions",
      label: "Volume",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">
            {row.transaction_count}
          </span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">
            Transactions
          </span>
        </div>
      ),
    },
    {
      key: "income",
      label: "Revenue Generated",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-black text-green-700">
            {formatCurrency(row.total_income)}
          </span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">
            Avg. Rs.{" "}
            {(
              parseFloat(row.total_income) / parseInt(row.transaction_count)
            ).toFixed(0)}{" "}
            / tx
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
            <BarChart3 size={16} className="text-red-600" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-red-600" size={32} />
            </div>
          ) : report.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 py-12">
              <Calendar size={32} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">
                No data available for this range
              </p>
            </div>
          ) : (
            <div className="h-72 flex items-end justify-between gap-1 pt-12 pb-6 px-6 overflow-x-auto no-scrollbar bg-gradient-to-t from-gray-50/50 to-white">
              {report.map((item) => {
                const heightPercent =
                  (parseFloat(item.total_income) / maxIncome) * 100;
                return (
                  <div
                    key={item.date}
                    className="flex flex-col items-center justify-end w-full min-w-[32px] group relative h-full"
                  >
                    <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 pointer-events-none whitespace-nowrap z-10 shadow-xl">
                      {item.date}: {formatCurrency(item.total_income)}
                    </div>
                    <div
                      className="w-full max-w-[12px] bg-red-100 group-hover:bg-red-600 transition-all rounded-t-sm"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    ></div>
                    <div className="mt-3 text-[9px] font-black text-gray-400 uppercase tracking-tighter transform -rotate-45 origin-top-left whitespace-nowrap opacity-60">
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
      <div className="space-y-4">
        {loading ? (
          <PageLoader message="Generating breakdown..." />
        ) : (
          <DataTable
            columns={columns}
            data={report}
            keyField="date"
            emptyIcon={Calendar}
            emptyTitle="No transactions"
            emptySubtitle="There is no financial data for the selected date range."
          />
        )}
      </div>
    </div>
  );
};

export default DailyIncomeReportPage;
