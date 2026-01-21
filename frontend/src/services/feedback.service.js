import api from "@/lib/api";

/**
 * Submit new feedback for a booking
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post("/feedback", feedbackData);
    return response.data?.data?.feedback;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

/**
 * Get all feedbacks for the authenticated customer
 */
export const getMyFeedbacks = async () => {
  try {
    const response = await api.get("/feedback/my");
    return response.data?.data?.feedbacks || [];
  } catch (error) {
    console.error("Error fetching my feedbacks:", error);
    throw error;
  }
};
