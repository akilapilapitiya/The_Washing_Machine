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
  AlertCircle,
  History,
  ClipboardList,
} from "lucide-react";
import { getBookings } from "@/services/booking.service";
import { submitFeedback, getMyFeedbacks } from "@/services/feedback.service";
import { COLORS } from "@/lib/colors";

const FeedbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(5);
  const [showSuccess, setShowSuccess] = useState(false);

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
      setError("Failed to load feedback records. Please try again.");
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

      setShowSuccess(true);
      setFeedbackText("");
      setSelectedBookingId("");
      setRating(5);

      // Refresh data to update "Previous Feedback" list
      await fetchInitialData();

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <div className="mx-auto px-4 py-12 space-y-10 max-w-7xl">
        <div className="space-y-2">
          <p
            className={`text-sm uppercase tracking-wide ${COLORS.text.brand} font-semibold`}
          >
            Customer Voice
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Your Feedback</h1>
          <p className="text-gray-500 max-w-2xl">
            Tell us about your service experience. Your ratings help our team
            maintain the highest standards of detail.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-4">
            <CheckCircle size={20} />
            <p className="font-medium">
              Thank you! Your feedback has been recorded.
            </p>
          </div>
        )}

        <Tabs defaultValue="submit" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
            <TabsTrigger
              value="submit"
              className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all font-bold"
            >
              <ClipboardList size={16} className="mr-2" />
              New Review
            </TabsTrigger>
            <TabsTrigger
              value="previous"
              className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all font-bold"
            >
              <History size={16} className="mr-2" />
              History ({feedbacks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="submit"
            className="animate-in fade-in duration-300"
          >
            <Card className="border-none shadow-lg outline outline-1 outline-gray-100">
              <CardHeader className="border-b bg-gray-50/50 rounded-t-xl">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare size={20} className={COLORS.text.brand} />
                  How was your service?
                </CardTitle>
                <CardDescription>
                  Select a recent service to rate your experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                {completedBookings.length > 0 ? (
                  <form onSubmit={handleSubmitFeedback} className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label
                          htmlFor="booking"
                          className="text-sm font-bold text-gray-700"
                        >
                          Select Recent Service *
                        </Label>
                        <select
                          id="booking"
                          value={selectedBookingId}
                          onChange={(e) => setSelectedBookingId(e.target.value)}
                          className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-all font-medium text-sm"
                          required
                        >
                          <option value="">-- Choose a service --</option>
                          {completedBookings.map((b) => (
                            <option key={b.bookingid} value={b.bookingid}>
                              {formatDate(b.bookingdate)} -{" "}
                              {b.services
                                ?.map((s) => s.serviceName)
                                .join(", ") || "Vehicle Service"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-gray-700">
                          Service Rating *
                        </Label>
                        <div className="flex h-12 items-center gap-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRating(s)}
                              className="focus:outline-none hover:scale-110 transition-transform"
                            >
                              <Star
                                size={24}
                                className={
                                  s <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            </button>
                          ))}
                          <span className="ml-auto font-black text-gray-400 text-sm">
                            {rating}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="feedback"
                        className="text-sm font-bold text-gray-700"
                      >
                        Detailed Experience *
                      </Label>
                      <textarea
                        id="feedback"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="What stood out during your visit? Was there anything we could have done better?"
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all placeholder:text-gray-400 text-sm font-medium"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-red-600 hover:bg-red-700 h-10 px-8 rounded-lg font-bold text-white flex items-center gap-2"
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Send size={18} />
                        )}
                        Submit Review
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-full w-max mx-auto">
                      <ClipboardList size={40} className="text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold">
                        All services reviewed
                      </h3>
                      <p className="text-gray-500 max-w-sm mx-auto text-sm">
                        You've already shared feedback for all your completed
                        services. Thank you for your support!
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {feedbacks.map((f) => (
                  <Card
                    key={f.feedbackid}
                    className="hover:shadow-md transition-all border-gray-100 flex flex-col"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          {renderStars(f.rating)}
                          <CardTitle className="text-lg font-bold mt-2">
                            {f.vehbrand} {f.vehmodel}
                          </CardTitle>
                          <p className={`text-xs ${COLORS.text.secondary}`}>
                            {f.vehplate}
                          </p>
                        </div>
                        <CheckCircle size={16} className="text-green-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 italic text-sm text-gray-700 leading-relaxed">
                        "{f.feedbackdescription}"
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <ClipboardList
                            size={12}
                            className={COLORS.text.brand}
                          />
                          <span>Services Performed</span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          {f.services?.join(", ") || "General Service"}
                        </p>
                      </div>
                    </CardContent>
                    <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-between items-center rounded-b-xl">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Service Date
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        {formatDate(f.bookingdate)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed py-24 bg-transparent border-gray-200">
                <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <History size={48} className="text-gray-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">No history available</h3>
                    <p className="text-gray-500 max-w-xs">
                      Once you submit feedback for a service, your reviews will
                      be archived here.
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
