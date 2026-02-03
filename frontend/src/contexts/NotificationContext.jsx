import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "@/configs/env";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let newSocket;

    if (user && token) {
      // Initialize socket connection
      // Clean URL to remove /api if present, as socket usually connects to root namespace
      const socketUrl = API_BASE_URL.replace("/api", "");

      newSocket = io(socketUrl, {
        auth: { token },
        query: { token }, // Fallback
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
      });

      newSocket.on("notification", (notification) => {
        console.log("[Socket] Received notification:", notification);
        // Play sound?
        // Show toast
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
  }, [user, token]);

  return (
    <NotificationContext.Provider value={{ socket }}>
      {children}
    </NotificationContext.Provider>
  );
};
