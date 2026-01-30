import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Calendar,
  Car,
  Send,
  CheckCircle,
  Star,
  Loader2,
  History,
  ClipboardList,
} from "lucide-react";
import { getBookings } from "@/services/booking.service";
import { submitFeedback, getMyFeedbacks } from "@/services/feedback.service";
import { COLORS } from "@/lib/colors";
import { formatDateShortSL } from "@/lib/dateFormat";
import { toast } from "sonner";

const FeedbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchInitialData();
  }, []);

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

      // Refresh data to update "Previous Feedback" list
      await fetchInitialData();
    } catch (err) {
      toast.error(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return formatDateShortSL(dateString);
  };

  const renderStars = (count, size = 16) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className={`h-12 w-12 animate-spin ${COLORS.icon.brand}`} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-12 space-y-10 max-w-5xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Your Feedback
          </h1>
          <p className="text-gray-500">
            Tell us about your service experience.
          </p>
        </div>

        <Tabs defaultValue="submit" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="submit"
              className="rounded-md data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all font-medium text-sm px-4 py-2"
            >
              <ClipboardList size={16} className="mr-2" />
              New Review
            </TabsTrigger>
            <TabsTrigger
              value="previous"
              className="rounded-md data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all font-medium text-sm px-4 py-2"
            >
              <History size={16} className="mr-2" />
              History ({feedbacks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="submit"
            className="animate-in fade-in duration-300"
          >
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
                  How was your service?
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Select a recent service to rate your experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {completedBookings.length > 0 ? (
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="booking"
                          className="text-sm font-medium text-gray-700"
                        >
                          Select Service
                        </Label>
                        <select
                          id="booking"
                          value={selectedBookingId}
                          onChange={(e) => setSelectedBookingId(e.target.value)}
                          className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white transition-all text-sm"
                          required
                        >
                          <option value="">Select a service...</option>
                          {completedBookings.map((b) => (
                            <option key={b.bookingid} value={b.bookingid}>
                              {formatDate(b.bookingdate)} —{" "}
                              {b.services
                                ?.map((s) => s.serviceName)
                                .join(", ") || "Vehicle Service"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="feedback"
                          className="text-sm font-medium text-gray-700"
                        >
                          Your Experience
                        </Label>
                        <textarea
                          id="feedback"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="What stood out during your visit?"
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 resize-none transition-all placeholder:text-gray-400 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-red-600 hover:bg-red-700 h-11 px-6 rounded-lg font-medium text-white shadow-sm flex items-center gap-2"
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Send size={16} />
                        )}
                        Submit Review
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <div className="p-3 bg-gray-50 rounded-full w-max mx-auto border border-gray-100">
                      <CheckCircle size={32} className="text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        All caught up!
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        You've reviewed all your completed services.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="previous"
            className="animate-in fade-in duration-300"
          >
            {feedbacks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {feedbacks.map((f) => (
                  <Card
                    key={f.feedbackid}
                    className="hover:shadow-md transition-all border-gray-200 flex flex-col overflow-hidden"
                  >
                    <CardHeader className="pb-3 pt-5 px-5 bg-white border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base font-bold text-gray-900">
                            {f.vehbrand} {f.vehmodel}
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {f.vehplate}
                          </p>
                        </div>
                        <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                          {formatDate(f.bookingdate)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 space-y-4">
                      <div className="relative pl-3 border-l-2 border-gray-200">
                        <p className="text-sm text-gray-700 italic">
                          "{f.feedbackdescription}"
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Services
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {f.services?.join(", ") || "General Service"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed py-16 bg-transparent border-gray-200">
                <CardContent className="flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="p-3 bg-gray-50 rounded-full border border-gray-100">
                    <History size={32} className="text-gray-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      No history available
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Your past reviews will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedbackPage;
