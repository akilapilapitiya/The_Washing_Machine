import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const NotificationBell = () => {
  const { socket } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNewNotification);
    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notification");
      const list = response.data.data.notifications;
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
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
      console.error("Failed to mark read", error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notification/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on metadata or type if implemented
    // For now, maybe just close dropdown
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-white" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={markAllRead}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
              >
                Mark all read
              </Button>
            )}
          </div>

          <ScrollArea className="h-[400px]">
            {notifications.length > 0 ? (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4",
                      notification.is_read
                        ? "border-transparent opacity-75"
                        : "border-red-500 bg-red-50/10",
                    )}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 space-y-1">
                        <p
                          className={cn(
                            "text-sm",
                            !notification.is_read
                              ? "font-semibold text-gray-900"
                              : "text-gray-700",
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-red-600 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <Bell className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p>No notifications yet</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
