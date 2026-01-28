import api from "@/lib/api";

export const getNotifications = async () => {
  const response = await api.get("/notification");
  return response.data?.data?.notifications || [];
};

export const markAsRead = async (id) => {
  await api.put(`/notification/${id}/read`);
};

export const markAllAsRead = async () => {
  await api.put("/notification/read-all");
};
