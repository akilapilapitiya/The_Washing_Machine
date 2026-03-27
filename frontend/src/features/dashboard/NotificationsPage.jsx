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
  Hash,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/common/DataTable";
import PageToolbar from "@/components/common/PageToolbar";

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotification();
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((notif) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return [
      notif.title,
      notif.message,
      notif.type,
      notif.booking_id ? `booking ${notif.booking_id}` : "",
      notif.is_read ? "read" : "unread",
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });

  // Memoize action button for stable reference
  const headerAction = React.useMemo(() => (
    <Button
      variant="outline"
      className="hidden sm:flex h-10 px-5 text-sm font-medium text-gray-600 hover:text-red-600 bg-white border-gray-300"
      onClick={markAllAsRead}
      disabled={unreadCount === 0}
    >
      <CheckCircle size={14} className="mr-2" />
      Mark all read
    </Button>
  ), [unreadCount, markAllAsRead]);

  const toolbar = React.useMemo(
    () => (
      <PageToolbar
        stats={[
          { icon: Bell, label: "Total", value: notifications.length, iconClassName: "text-blue-500" },
          { icon: AlertTriangle, label: "Unread", value: unreadCount, iconClassName: "text-red-500" },
        ]}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search notifications..."
      />
    ),
    [notifications.length, unreadCount, searchQuery],
  );

  useSetPageHeader(
    "Updates",
    "Notifications",
    "Stay tuned with your latest bookings and system alerts.",
    headerAction,
    toolbar,
  );

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.booking_id) {
      // Determine route based on user role context flag
      if (isCustomer) {
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

  const columns = [
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <div className="flex items-center justify-center w-10">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${getBgColor(
              row.type,
            )}`}
          >
            {getIcon(row.type)}
          </div>
        </div>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (row) => (
        <div className="flex flex-col max-w-lg cursor-pointer" onClick={() => handleNotificationClick(row)}>
          <span
            className={`text-sm text-gray-900 ${
              !row.is_read ? "font-bold" : "font-medium"
            }`}
          >
            {row.title}
          </span>
          <span className="text-xs text-gray-500 truncate leading-relaxed">
            {row.message}
          </span>
          {row.booking_id && (
            <div className="mt-1 flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Booking #{String(row.booking_id).padStart(4, "0")} <ChevronRight size={10} className="ml-0.5" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "time",
      label: "Time",
      render: (row) => (
        <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2 pr-2">
          {!row.is_read ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide border border-red-200">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
              New
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide border border-gray-200">
              <Check size={10} />
              Read
            </span>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader message="Loading notifications..." />;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <DataTable
        columns={columns}
        data={filteredNotifications}
        keyField="id"
        emptyIcon={Bell}
        emptyTitle="No notifications yet"
        emptySubtitle="We'll notify you when there are updates to your bookings, payments, or other important events."
      />
    </div>
    
  );
};

export default NotificationsPage;
