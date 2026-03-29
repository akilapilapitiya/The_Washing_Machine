import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, Loader2, CheckCircle } from "lucide-react";
import * as schedulerService from "@/services/scheduler.service";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import BookingFlowToolbar from "@/components/common/BookingFlowToolbar";

const MyLeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      toast.dismiss();
      const data = await schedulerService.getMyLeaves();
      setLeaves(data || []);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      toast.error("Failed to load your leave records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Separate upcoming and past leaves
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingLeaves = leaves.filter(
    (leave) => new Date(leave.leaveenddate) >= today,
  );
  const pastLeaves = leaves.filter(
    (leave) => new Date(leave.leaveenddate) < today,
  );

  const [activeTab, setActiveTab] = useState("upcoming");

  const toolbarTabs = useMemo(
    () => [
      { id: "upcoming", label: `Upcoming (${upcomingLeaves.length})` },
      { id: "history", label: `History (${pastLeaves.length})` },
    ],
    [upcomingLeaves.length, pastLeaves.length],
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const toolbar = useMemo(
    () => (
      <BookingFlowToolbar
        tabs={toolbarTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabsAriaLabel="Leave sections"
        meta={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-gray-200">
              <Calendar size={13} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-500">Total</span>
              <span className="text-xs font-semibold text-gray-900">
                {leaves.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-gray-200">
              <CheckCircle size={13} className="text-green-500" />
              <span className="text-xs font-semibold text-gray-500">
                Upcoming
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {upcomingLeaves.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-gray-200">
              <FileText size={13} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-500">
                History
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {pastLeaves.length}
              </span>
            </div>
          </div>
        }
      />
    ),
    [
      activeTab,
      toolbarTabs,
      leaves.length,
      pastLeaves.length,
      upcomingLeaves.length,
    ],
  );

  useSetPageHeader(
    "Employee Portal",
    "My Leaves",
    "View your approved leave requests and time off.",
    null,
    toolbar,
  );

  const columns = [
    {
      key: "date_range",
      label: "Leave Period",
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900">
            {formatDate(row.leavestartdate)} - {formatDate(row.leaveenddate)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {calculateDuration(row.leavestartdate, row.leaveenddate)}{" "}
            {calculateDuration(row.leavestartdate, row.leaveenddate) === 1
              ? "day"
              : "days"}
          </p>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (row) => (
        <div className="flex items-start gap-2 text-sm max-w-sm">
          <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">{row.leavereason}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border bg-green-50 text-green-700 border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5" />
          Approved
        </span>
      ),
    },
    {
      key: "requested_on",
      label: "Requested On",
      className: "white-space-nowrap",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Clock size={12} className="text-gray-400" />
          {formatDate(row.created_at)}
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader message="Loading leave records..." />;

  const displayLeaves = activeTab === "upcoming" ? upcomingLeaves : pastLeaves;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <DataTable
        columns={columns}
        data={displayLeaves}
        keyField="leaveid"
        emptyIcon={activeTab === "upcoming" ? Calendar : FileText}
        emptyTitle={
          activeTab === "upcoming" ? "No Upcoming Leaves" : "No Leave History"
        }
        emptySubtitle={
          activeTab === "upcoming"
            ? "You don't have any approved leaves scheduled."
            : "Your past leave records will appear here."
        }
      />
    </div>
  );
};

export default MyLeavesPage;
