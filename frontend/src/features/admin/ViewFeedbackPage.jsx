import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Star,
  User,
  Calendar,
  Loader2,
  Briefcase,
} from "lucide-react";
import { getAllFeedbacks } from "@/services/feedback.service";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

import { toast } from "sonner";
const ViewFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useSetPageHeader(
    "Quality Assurance",
    "Customer Feedback",
    "Monitor customer satisfaction and review employee performance.",
  );

  if (loading) return <PageLoader message="Loading feedback..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {feedbacks.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map((item) => (
              <Card
                key={item.feedbackid}
                className="flex flex-col h-full hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {renderStars(item.rating)}
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {item.rating}/5
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base line-clamp-1 italic font-medium text-gray-700">
                    &quot;{item.feedbackdescription}&quot;
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                      <User size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                        Customer
                      </p>
                      <p className="text-sm font-bold">{item.cusname}</p>
                    </div>
                  </div>

                  {/* Assigned Employee Info */}
                  <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                    <div className="w-8 h-8 bg-white border border-red-200 rounded-full flex items-center justify-center">
                      <Briefcase size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">
                        Assigned Operative
                      </p>
                      <p className="text-sm font-bold text-red-900">
                        {item.assigned_employee || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-400 font-mono mt-2">
                    BOOKING REF: BK-{item.bookingid.toString().padStart(4, "0")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
              <p className="text-gray-500">
                Customer reviews and ratings will appear here once they are
                submitted.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ViewFeedbackPage;
