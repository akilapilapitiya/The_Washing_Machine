import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BookingAvailabilityCalendar = ({
  monthLabel,
  calendarDays,
  isPrevMonthDisabled,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
  selectedDate,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevMonth}
          disabled={isPrevMonthDisabled}
          className="h-9 w-9 p-0 border-gray-200"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="text-sm font-bold text-gray-900">{monthLabel}</p>
        <Button
          type="button"
          variant="outline"
          onClick={onNextMonth}
          className="h-9 w-9 p-0 border-gray-200"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
        {WEEK_DAYS.map((dayName) => (
          <div key={dayName} className="text-center py-1">
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayCell, index) => {
          if (!dayCell) {
            return <div key={`blank-${index}`} className="h-11" />;
          }

          return (
            <button
              key={dayCell.dateKey}
              type="button"
              onClick={() => !dayCell.isDisabled && onDateSelect(dayCell.dateKey)}
              disabled={dayCell.isDisabled}
              title={
                dayCell.isHoliday
                  ? `${dayCell.holidayName} (Holiday)`
                  : dayCell.isBlocked
                    ? "Employee unavailable"
                    : undefined
              }
              className={cn(
                "h-11 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center justify-center",
                dayCell.isSelected
                  ? "border-red-600 bg-red-600 text-white"
                  : dayCell.isHoliday
                    ? "border-amber-200 bg-amber-50 text-amber-700 cursor-not-allowed"
                    : dayCell.isBlocked
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : dayCell.isDisabled
                        ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                        : "border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600",
              )}
            >
              {dayCell.day}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded bg-white border border-gray-300" />
          Available
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded bg-red-600" />
          Selected
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          Holiday
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
          Unavailable
        </div>
      </div>

      {selectedDate && (
        <p className="text-xs font-medium text-gray-500">
          Selected date:{" "}
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
};

export default BookingAvailabilityCalendar;
