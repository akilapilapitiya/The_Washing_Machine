import React from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  CreditCard,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.booking_id) {
      // Determine route based on user role
      if (user.role === "customer") {
        // For customers, maybe navigate to bookings list as specific booking details page might not be fully standard yet
        navigate(`/dashboard/bookings`);
      } else {
        // For employees/admin
        navigate(`/dashboard/employee/service/${notification.booking_id}`);
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={20} className="text-amber-500" />;
      case "success":
        return <CheckCircle size={20} className="text-green-500" />;
      case "error":
        return <ShieldAlert size={20} className="text-red-500" />;
      case "booking":
        return <Calendar size={20} className="text-blue-500" />;
      case "payment":
        return <CreditCard size={20} className="text-purple-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "warning":
        return "bg-amber-50";
      case "success":
        return "bg-green-50";
      case "error":
        return "bg-red-50";
      default:
        return "bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            View and manage your updates and alerts
          </p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Check className="mr-2 h-4 w-4 text-gray-500" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 text-gray-200 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <Bell size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No notifications yet
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
              We'll notify you when there are updates to your bookings,
              payments, or other important events.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer group ${
                  !notification.is_read ? "bg-red-50/20" : ""
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center ${getBgColor(notification.type)}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <p
                          className={`text-base text-gray-900 ${!notification.is_read ? "font-semibold" : "font-medium"}`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap font-medium flex-shrink-0">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          { addSuffix: true },
                        )}
                      </span>
                    </div>

                    {/* Action Hint */}
                    {notification.booking_id && (
                      <div className="mt-3 flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        View details &rarr;
                      </div>
                    )}
                  </div>

                  {!notification.is_read && (
                    <div className="flex-shrink-0 self-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-white shadow-sm"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
