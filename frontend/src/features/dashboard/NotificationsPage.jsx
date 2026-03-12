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
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import { Button } from "@/components/ui/button"; // Assuming Button component is from shadcn/ui

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Memoize action button for stable reference
  const headerAction = React.useMemo(() => (
    <Button
      variant="outline"
      size="sm"
      className="hidden sm:flex text-gray-500 hover:text-red-600 bg-white"
      onClick={markAllAsRead}
      disabled={unreadCount === 0}
    >
      <CheckCircle size={14} className="mr-2" />
      Mark all read
    </Button>
  ), [unreadCount]);

  useSetPageHeader(
    "Updates",
    "Notifications",
    "Stay tuned with your latest bookings and system alerts.",
    headerAction,
  );

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

  if (loading) return <PageLoader message="Loading notifications..." />;

  return (
          <div className="mx-auto w-full max-w-5xl space-y-6">
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
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer group ${!notification.is_read ? "bg-red-50/20" : ""
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
