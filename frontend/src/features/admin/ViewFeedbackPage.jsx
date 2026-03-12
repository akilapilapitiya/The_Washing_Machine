import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Star,
  Calendar,
  Briefcase,
} from "lucide-react";
import { getAllFeedbacks } from "@/services/feedback.service";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import PageToolbar from "@/components/common/PageToolbar";
import { matchesQuickDateRange } from "@/utils/quickDateRange";

import { toast } from "sonner";
const ViewFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const data = await getAllFeedbacks();
        setFeedbacks(data);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        toast.error("Failed to load feedback records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300 fill-gray-100"
            }
          />
        ))}
      </div>
    );
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        feedback.cusname,
        feedback.assigned_employee,
        feedback.feedbackdescription,
        feedback.bookingid,
        feedback.rating,
      ].some((value) => String(value || "").toLowerCase().includes(query));

    const matchesDate = matchesQuickDateRange(feedback.created_at, dateRange);

    return matchesSearch && matchesDate;
  });

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, feedback) => sum + Number(feedback.rating || 0), 0) /
          feedbacks.length
        ).toFixed(1)
      : "0.0";

  const toolbar = React.useMemo(
    () => (
      <PageToolbar
        stats={[
          { icon: MessageSquare, label: "Total", value: feedbacks.length, iconClassName: "text-gray-500" },
          { icon: Star, label: "Avg Rating", value: averageRating, iconClassName: "text-amber-500" },
          {
            icon: Star,
            label: "5 Stars",
            value: feedbacks.filter((feedback) => Number(feedback.rating) === 5).length,
            iconClassName: "text-yellow-500",
          },
        ]}
        filters={[
          { id: "all", label: "All Time" },
          { id: "today", label: "Today" },
          { id: "month", label: "This Month" },
        ]}
        activeFilter={dateRange}
        onFilterChange={setDateRange}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search feedback..."
      />
    ),
    [averageRating, dateRange, feedbacks, searchQuery],
  );

  useSetPageHeader(
    "Quality Assurance",
    "Customer Feedback",
    "Monitor customer satisfaction and review employee performance.",
    null,
    toolbar,
  );

  if (loading) return <PageLoader message="Loading feedback..." />;

  const columns = [
    {
      key: "booking",
      label: "Booking",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-gray-500">
            BK-{row.bookingid.toString().padStart(4, "0")}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <Calendar size={12} />
            {new Date(row.created_at).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (row) => (
        <div className="flex items-center gap-2">
          {renderStars(row.rating)}
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            {row.rating}/5
          </span>
        </div>
      ),
    },
    {
      key: "feedback",
      label: "Feedback",
      render: (row) => (
        <p className="text-sm italic text-gray-700 line-clamp-2 max-w-[340px]">
          &quot;{row.feedbackdescription}&quot;
        </p>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => (
        <span className="text-sm font-bold text-gray-900">{row.cusname}</span>
      ),
    },
    {
      key: "employee",
      label: "Assigned Operative",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-900 bg-red-50 border border-red-100 px-2 py-1 rounded">
          <Briefcase size={12} className="text-red-600" />
          {row.assigned_employee || "Unassigned"}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <DataTable
        columns={columns}
        data={filteredFeedbacks}
        keyField="feedbackid"
        emptyIcon={MessageSquare}
        emptyTitle="No feedback found"
        emptySubtitle={searchQuery ? "No feedback matches your current filters." : "Customer reviews and ratings will appear here once they are submitted."}
      />
    </div>
  );
};

export default ViewFeedbackPage;
