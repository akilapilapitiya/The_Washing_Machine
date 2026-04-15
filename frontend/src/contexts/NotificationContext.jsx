import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "@/configs/env";
import api from "@/lib/api";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notification");
      const data = response.data?.data?.notifications || [];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notification/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      toast.error("Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notification/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
      toast.error("Failed to update notifications");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (user && token) {
      fetchNotifications();
      // Poll every 60s as a fallback
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    let newSocket;
    const token = localStorage.getItem("token");

    if (user && token) {
      const socketUrl = API_BASE_URL.replace("/api", "");

      newSocket = io(socketUrl, {
        auth: { token },
        query: { token },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
      });

      newSocket.on("notification", (notification) => {
        console.log("[Socket] Received notification:", notification);

        // Add to state immediately
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        toast(notification.title, {
          description: notification.message,
          action: {
            label: "View",
            onClick: () => console.log("Navigate to", notification),
          },
        });
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user]);

  const value = {
    socket,
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
