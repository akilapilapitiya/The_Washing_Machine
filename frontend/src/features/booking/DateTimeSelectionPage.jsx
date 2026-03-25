import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import * as schedulerService from "@/services/scheduler.service";
import * as holidayService from "@/services/systemHoliday.service";
import { toast } from "sonner";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import BookingAvailabilityCalendar from "@/components/common/BookingAvailabilityCalendar";
import BookingFlowToolbar, {
  BookingToolbarBackButton,
  BookingToolbarActionButton,
} from "@/components/common/BookingFlowToolbar";

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// Generate time slots between 9 AM and 4 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 16; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    const displayTime =
      hour < 12
        ? `${hour}:00 AM`
        : hour === 12
          ? `12:00 PM`
          : `${hour - 12}:00 PM`;
    slots.push({ value: time, display: displayTime });
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const DateTimeSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const seed = new Date();
    seed.setDate(seed.getDate() + 1);
    return new Date(seed.getFullYear(), seed.getMonth(), 1);
  });
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState(null);

  const { vehicleId, serviceIds, locationId, locationData, employeeId, employeeName } =
    location.state || {};

  useEffect(() => {
    if (!vehicleId) {
      navigate("/dashboard/book");
      return;
    }

    if (!employeeId || employeeId === "any") {
      toast.error("An assigned employee is required before selecting date and time.");
      navigate("/dashboard/booking/employee", {
        state: {
          vehicleId,
          serviceIds,
          locationId,
          locationData,
        },
      });
    }
  }, [vehicleId, employeeId, navigate, serviceIds, locationId, locationData]);

  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return date;
  }, []);
  const minDate = useMemo(() => toDateKey(tomorrow), [tomorrow]);
  const minMonthStart = useMemo(
    () => new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1),
    [tomorrow],
  );



  const blockedLookup = useMemo(() => new Set(blockedDates), [blockedDates]);

  const monthLabel = useMemo(
    () =>
      calendarMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [calendarMonth],
  );

  const isPrevMonthDisabled = useMemo(
    () =>
      calendarMonth.getFullYear() === minMonthStart.getFullYear() &&
      calendarMonth.getMonth() === minMonthStart.getMonth(),
    [calendarMonth, minMonthStart],
  );

  const calendarDays = useMemo(() => {
    const firstDateOfMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
    );
    const firstWeekDay = firstDateOfMonth.getDay();
    const daysInMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0,
    ).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekDay; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth(),
        day,
      );
      const dateKey = toDateKey(date);
      const daysHolidays = holidays.filter((h) => h.date === dateKey);
      const fullDayHolidays = daysHolidays.filter((h) => !h.startTime || !h.endTime);
      
      const holidayName = daysHolidays.map((h) => h.name).join(", ");
      const isHoliday = daysHolidays.length > 0;
      const isBlocked = blockedLookup.has(dateKey);
      const isBeforeMinDate = dateKey < minDate;
      // Only fully block if there's a FULL DAY holiday, blocked by schedule, or past date
      const isDisabled = fullDayHolidays.length > 0 || isBlocked || isBeforeMinDate;

      cells.push({
        day,
        dateKey,
        isHoliday,
        holidayName,
        isBlocked,
        isDisabled,
        isSelected: selectedDate === dateKey,
      });
    }

    return cells;
  }, [calendarMonth, holidays, blockedLookup, minDate, selectedDate]);

  useEffect(() => {
    fetchHolidays();
    if (employeeId && employeeId !== "any") {
      fetchBlockedDates();
    }
  }, [employeeId]);

  const fetchHolidays = async () => {
    try {
      const holidayData = await holidayService.getUpcomingHolidays();
      if (Array.isArray(holidayData) && holidayData.length > 0) {
        setHolidays(
          holidayData.map((h) => ({
            date: h.holidaydate.split("T")[0], // Use date string directly, avoid timezone conversion
            name: h.holidayname,
            startTime: h.starttime,
            endTime: h.endtime,
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch holidays:", err.message);
      setHolidays([]);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const dates = await schedulerService.getBlockedDates(employeeId);
      // Handle both array responses and empty responses
      if (Array.isArray(dates) && dates.length > 0) {
        setBlockedDates(
          dates.map((d) => new Date(d).toISOString().split("T")[0]),
        );
      } else {
        setBlockedDates([]);
      }
    } catch (err) {
      // Only log actual errors, not empty responses
      console.error("Failed to sync operative calendar:", err.message);
      setBlockedDates([]);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      // Check if date has a full-day holiday
      const daysHolidays = holidays.filter((h) => h.date === selectedDate);
      const fullDayHoliday = daysHolidays.find((h) => !h.startTime || !h.endTime);
      
      if (fullDayHoliday) {
        setError(
          `Bookings are not available on ${fullDayHoliday.name} (System Holiday).`,
        );
        setAvailableSlots([]);
        setSelectedTime(null); // Clear selected time
        return;
      }
      // Check if operative is offline
      if (blockedDates.includes(selectedDate)) {
        setError(
          "This operative is offline on the selected date. Please choose another date.",
        );
        setAvailableSlots([]);
        setSelectedTime(null); // Clear selected time
        return;
      }
      setError(null);
      fetchDaySchedule();
    }
  }, [selectedDate, blockedDates, holidays]);

  const fetchDaySchedule = async () => {
    if (!employeeId || employeeId === "any") {
      setAvailableSlots(timeSlots.map((s) => s.value));
      return;
    }

    try {
      setLoadingAvailability(true);
      const schedule = await schedulerService.getDaySchedule(
        employeeId,
        selectedDate,
      );

      // Defensive: ensure schedule is an array
      const scheduleArray = Array.isArray(schedule) ? schedule : [];

      // Filter slots
      // A slot is available if it doesn't overlap with any schedule entry OR partial holiday
      const partialHolidays = holidays.filter((h) => h.date === selectedDate && h.startTime && h.endTime);
      
      const filtered = timeSlots.filter((slot) => {
        const slotStart = slot.value;
        // Assume 1 hour default duration for checking overlap in basic phase
        const [h, m] = slotStart.split(":").map(Number);
        const slotEnd = `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

        const isOverlapping = scheduleArray.some((entry) => {
          // NOT (s.scheduleendtime <= $3::time OR s.schedulestarttime >= $4::time)
          return !(
            entry.scheduleendtime <= slotStart ||
            entry.schedulestarttime >= slotEnd
          );
        }) || partialHolidays.some((holiday) => {
          return !(
            holiday.endTime <= slotStart || 
            holiday.startTime >= slotEnd
          );
        });

        return !isOverlapping;
      });

      setAvailableSlots(filtered.map((s) => s.value));
    } catch (err) {
      console.error("Schedule fetch failed:", err.message);
      toast.error(
        "Strategic error. Could not retrieve real-time availability.",
      );
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleDateChange = (nextDate) => {
    setSelectedDate(nextDate);
    setSelectedTime(null); // Reset time when date changes
  };

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    setCalendarMonth(
      (prevMonth) =>
        new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCalendarMonth(
      (prevMonth) =>
        new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1),
    );
  };

  const handleContinue = useCallback(() => {
    // Navigate to confirmation/summary page
    navigate("/dashboard/booking/confirmation", {
      state: {
        vehicleId,
        serviceIds,
        locationId,
        locationData,
        employeeId,
        employeeName,
        date: selectedDate,
        time: selectedTime,
      },
    });
  }, [
    navigate,
    vehicleId,
    serviceIds,
    locationId,
    locationData,
    employeeId,
    employeeName,
    selectedDate,
    selectedTime,
  ]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const isSlotAvailable = (slotValue) => {
    return availableSlots.includes(slotValue);
  };

  const appointmentOverview = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;

    const [startHour, startMinute] = selectedTime.split(":").map(Number);
    const start = new Date(2000, 0, 1, startHour, startMinute, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return {
      date: new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      startTime: start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      endTime: end.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  }, [selectedDate, selectedTime]);

  const toolbar = useMemo(
    () => (
      <BookingFlowToolbar
        rightSlot={(
          <>
            <BookingToolbarBackButton onClick={handleBack} />
            <BookingToolbarActionButton
              onClick={handleContinue}
              disabled={!selectedDate || !selectedTime || !!error}
              className="px-8"
            >
              Continue
            </BookingToolbarActionButton>
          </>
        )}
      />
    ),
    [handleBack, handleContinue, selectedDate, selectedTime, error],
  );
  useSetPageHeader(
    "BOOK SERVICE",
    "Select Date & Time",
    "Choose your appointment date and time.",
    null,
    toolbar
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-5 md:p-6">
            <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] items-start">
              <div>
                <BookingAvailabilityCalendar
                  monthLabel={monthLabel}
                  calendarDays={calendarDays}
                  isPrevMonthDisabled={isPrevMonthDisabled}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onDateSelect={handleDateChange}
                  selectedDate={selectedDate}
                />
              </div>

              <div className="space-y-4">
                {loadingAvailability && selectedDate && !error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Loading slots...
                  </div>
                )}

                {!selectedDate && (
                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
                    Pick a day from the calendar to view time slots.
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 text-red-700 bg-red-50 p-4 rounded-lg border border-red-100">
                    <AlertCircle size={16} className="mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {selectedDate && !error && (
                  <>
                    {appointmentOverview && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                          Appointment Overview
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Date
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">
                              {appointmentOverview.date}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Start
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">
                              {appointmentOverview.startTime}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              End
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">
                              {appointmentOverview.endTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {timeSlots.map((slot) => {
                        const available = isSlotAvailable(slot.value);
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            onClick={() => available && setSelectedTime(slot.value)}
                            disabled={!available || loadingAvailability}
                            className={cn(
                              "px-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 active:scale-95",
                              selectedTime === slot.value
                                ? "border-red-600 bg-red-600 text-white shadow-sm"
                                : !available
                                  ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600",
                            )}
                          >
                            {slot.display}
                          </button>
                        );
                      })}
                    </div>

                    {!loadingAvailability && availableSlots.length === 0 && (
                      <div className="flex items-start gap-2 text-red-700 bg-red-50 p-4 rounded-lg border border-red-100">
                        <AlertCircle size={16} className="mt-0.5" />
                        <p className="text-sm font-medium">
                          No matching slots available for this operative on the selected date.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DateTimeSelectionPage;
