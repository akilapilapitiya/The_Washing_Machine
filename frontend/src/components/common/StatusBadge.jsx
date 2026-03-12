import React from "react";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle, Zap } from "lucide-react";

/**
 * StatusBadge — single source of truth for all status pills in the portal.
 * Replace all local StatusBadge definitions with this shared import.
 *
 * @param {string} status - One of: pending, confirmed, in_progress, completed, paid, cancelled, expired, active
 * @param {string} [className] - Optional extra classes
 */
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-100",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    classes: "bg-blue-50 text-blue-700 border-blue-100",
    icon: CheckCircle,
  },
  in_progress: {
    label: "In Progress",
    classes: "bg-indigo-50 text-indigo-700 border-indigo-100",
    icon: Loader2,
  },
  inProgress: {
    label: "In Progress",
    classes: "bg-indigo-50 text-indigo-700 border-indigo-100",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle,
  },
  paid: {
    label: "Paid",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-gray-50 text-gray-500 border-gray-200",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    classes: "bg-red-50 text-red-600 border-red-100",
    icon: AlertCircle,
  },
  active: {
    label: "Active",
    classes: "bg-green-50 text-green-700 border-green-100",
    icon: Zap,
  },
};

const StatusBadge = ({ status, className = "" }) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status ?? "Unknown",
    classes: "bg-gray-50 text-gray-600 border-gray-200",
    icon: null,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.classes} ${className}`}
    >
      {Icon && <Icon size={10} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
