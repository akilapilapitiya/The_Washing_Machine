import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Send,
  CheckCircle,
  Star,
  Loader2,
  History,
  X,
} from "lucide-react";
import { getBookings } from "@/services/booking.service";
import { submitFeedback, getMyFeedbacks } from "@/services/feedback.service";
import { COLORS } from "@/lib/colors";
import { formatDateShortSL } from "@/lib/dateFormat";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

const FeedbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // New state for modal

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

      // Filter for completed/paid bookings that don't have feedback yet
      const feedbackBookingIds = new Set(feedbacksData.map((f) => f.bookingid));
      const eligibleBookings = bookingsData.filter(
        (b) =>
          (b.bookingstatus === "completed" || b.bookingstatus === "paid") &&
          !feedbackBookingIds.has(b.bookingid),
      );

      setCompletedBookings(eligibleBookings);
      setFeedbacks(feedbacksData);
    } catch (err) {
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
        rating: rating,
      });

      toast.success("Thank you! Your feedback has been recorded.");
      setFeedbackText("");
      setSelectedBookingId("");
      setRating(5);
      setIsModalOpen(false); // Close modal on successful submission

      // Refresh data to update "Previous Feedback" list
      await fetchInitialData();
    } catch (err) {
      toast.error(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count, size = 14) => { // Updated default size
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
            }
          />
        ))}
      </div>
    );
  };

  // useMemo for header action button
  const headerAction = useMemo(() => (
    <Button
      onClick={() => setIsModalOpen(true)}
      className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-6 rounded-lg shadow-sm flex items-center gap-2"
    >
      <MessageSquare size={16} />
      Add Feedback
    </Button>
  ), []);

  useSetPageHeader(
    "Customer Care", // Updated title
    "Service Feedback", // Updated subtitle
    "Monitor your reviews and share your latest service experience.", // Updated description
    headerAction, // Added header action
  );

  if (loading) return <PageLoader message="Loading feedback records..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6"> {/* Updated max-w and space-y */}
      <div className="space-y-6">
        {feedbacks.length > 0 ? (
          <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Service / Vehicle
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Services
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Your Review
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {feedbacks.map((f) => (
                    <tr
                      key={f.feedbackid}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 leading-tight">
                            {f.vehbrand} {f.vehmodel}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 italic">
                            {f.vehplate}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {formatDateShortSL(f.bookingdate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-600 font-medium line-clamp-1 max-w-[150px]" title={f.services?.join(", ")}>
                          {f.services?.join(", ") || "General Service"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {renderStars(f.rating || 5)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600 italic line-clamp-1 max-w-[250px]" title={f.feedbackdescription}>
                          "{f.feedbackdescription}"
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="border-dashed py-24 bg-transparent border-gray-200">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <MessageSquare size={48} className="text-gray-300" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold">No feedback history</h3>
                <p className="text-gray-500 max-w-xs text-sm">
                  Once you review your services, they will be listed here.
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Share Your First Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <MessageSquare size={20} />
                  </div>
                  Submit Service Feedback
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
                      <Label htmlFor="booking" className="text-sm font-bold text-gray-700">
                        Select Recent Service <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="booking"
                        value={selectedBookingId}
                        onChange={(e) => setSelectedBookingId(e.target.value)}
                        className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm"
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
                      <Label className="text-sm font-bold text-gray-700">Service Rating</Label>
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
                        <span className="ml-2 text-sm font-bold text-gray-900">{rating}/5</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feedback" className="text-sm font-bold text-gray-700">
                        Your Comments <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="feedback"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Tell us what you liked or what we can improve..."
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] h-11 bg-red-600 hover:bg-red-700 font-bold text-white shadow-md shadow-red-900/10"
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
                    <h3 className="text-lg font-bold text-gray-900">All Reviews Completed</h3>
                    <p className="text-gray-500 text-sm max-w-[280px] mx-auto">
                      You've already rated all your recent services. Check back after your next visit!
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="w-full h-11 mt-4"
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
