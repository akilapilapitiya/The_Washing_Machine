import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Send,
  CheckCircle,
  Star,
  Loader2,
  X,
  Hash,
} from "lucide-react";
import { getBookings } from "@/services/booking.service";
import { submitFeedback, getMyFeedbacks } from "@/services/feedback.service";
import { formatDateShortSL } from "@/lib/dateFormat";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";

const renderStars = (count, size = 12) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
      />
    ))}
  </div>
);

const FeedbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(5);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [bookingsData, feedbacksData] = await Promise.all([
        getBookings(),
        getMyFeedbacks(),
      ]);
      const feedbackBookingIds = new Set(feedbacksData.map((f) => f.bookingid));
      const eligibleBookings = bookingsData.filter(
        (b) =>
          (b.bookingstatus === "completed" || b.bookingstatus === "paid") &&
          !feedbackBookingIds.has(b.bookingid),
      );
      setCompletedBookings(eligibleBookings);
      setFeedbacks(feedbacksData);
    } catch {
      toast.error("Failed to load feedback records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedBookingId || !feedbackText.trim()) return;
    try {
      setSubmitting(true);
      await submitFeedback({
        bookingId: parseInt(selectedBookingId),
        description: feedbackText,
        rating,
      });
      toast.success("Thank you! Your feedback has been recorded.");
      setFeedbackText("");
      setSelectedBookingId("");
      setRating(5);
      setIsModalOpen(false);
      await fetchInitialData();
    } catch (err) {
      toast.error(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const headerAction = useMemo(
    () => (
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[11px] h-10 px-6 rounded-lg shadow-md flex items-center gap-2"
      >
        <MessageSquare size={16} />
        Add Feedback
      </Button>
    ),
    [],
  );

  useSetPageHeader(
    "Customer Care",
    "Service Feedback",
    "Monitor your reviews and share your latest service experience.",
    headerAction,
  );

  if (loading) return <PageLoader message="Loading feedback records..." />;

  const columns = [
    {
      key: "feedbackid",
      label: "ID",
      render: (row) => (
        <div className="flex items-center gap-1.5 opacity-60">
          <Hash size={12} />
          <span className="font-mono text-xs font-bold text-gray-600">
            {String(row.bookingid).padStart(4, "0")}
          </span>
        </div>
      ),
    },
    {
      key: "vehicle",
      label: "Vehicle Details",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 leading-tight">
            {row.vehbrand} {row.vehmodel}
          </span>
          <span className="text-[10px] font-mono text-gray-500 italic">
            {row.vehplate}
          </span>
        </div>
      ),
    },
    {
      key: "bookingdate",
      label: "Service Date",
      render: (row) => (
        <span className="text-sm font-bold text-gray-700">
          {formatDateShortSL(row.bookingdate)}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {renderStars(row.rating || 5)}
          <span className="text-[9px] font-black uppercase text-gray-400">
            {row.rating}/5 Score
          </span>
        </div>
      ),
    },
    {
      key: "feedbackdescription",
      label: "Your Satisfaction",
      render: (row) => (
        <p
          className="text-xs text-gray-600 italic line-clamp-2 max-w-[300px]"
          title={row.feedbackdescription}
        >
          "{row.feedbackdescription}"
        </p>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <DataTable
        columns={columns}
        data={feedbacks}
        keyField="feedbackid"
        emptyIcon={MessageSquare}
        emptyTitle="No feedback history"
        emptySubtitle="Once you review your services, they will be listed here."
        emptyAction={
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8 rounded-lg"
          >
            Share Your First Review
          </Button>
        }
      />

      {/* Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-100 pb-4 bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <MessageSquare size={20} />
                  </div>
                  Submit Feedback
                </CardTitle>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {completedBookings.length > 0 ? (
                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking" className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Select Recent Service
                      </Label>
                      <select
                        id="booking"
                        value={selectedBookingId}
                        onChange={(e) => setSelectedBookingId(e.target.value)}
                        className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm font-bold"
                        required
                      >
                        <option value="">Choose a service to review...</option>
                        {completedBookings.map((b) => (
                          <option key={b.bookingid} value={b.bookingid}>
                            {formatDateShortSL(b.bookingdate)} — {b.vehbrand} {b.vehmodel}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Service Rating
                      </Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              size={28}
                              className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-black text-gray-900">{rating}/5</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feedback" className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Your Comments
                      </Label>
                      <textarea
                        id="feedback"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Tell us what you liked or what we can improve..."
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 h-11 font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] h-11 bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest text-white shadow-md shadow-red-900/10"
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin mr-2" size={18} />
                      ) : (
                        <Send size={16} className="mr-2" />
                      )}
                      Submit Review
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="p-4 bg-green-50 rounded-full w-max mx-auto">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-900">All Reviews Completed</h3>
                    <p className="text-gray-500 text-sm max-w-[280px] mx-auto">
                      You've already rated all your recent services. Check back after your next visit!
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="w-full h-11 mt-4 font-bold"
                  >
                    Got it
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
