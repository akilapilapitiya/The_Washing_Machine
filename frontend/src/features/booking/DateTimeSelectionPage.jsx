import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import * as schedulerService from "@/services/scheduler.service";
import * as holidayService from "@/services/systemHoliday.service";

import { toast } from "sonner";
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
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState(null);

  const { vehicleId, serviceIds, locationId, locationData, employeeId } =
    location.state || {};

  // Get tomorrow's date in YYYY-MM-DD format for min date (no same-day bookings)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

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
      // Check if date is a holiday
      const holiday = holidays.find((h) => h.date === selectedDate);
      if (holiday) {
        setError(
          `Bookings are not available on ${holiday.name} (System Holiday).`,
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
      // A slot is available if it doesn't overlap with any schedule entry
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

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleContinue = () => {
    // Navigate to confirmation/summary page
    navigate("/dashboard/booking/confirmation", {
      state: {
        vehicleId,
        serviceIds,
        locationId,
        locationData,
        employeeId,
        date: selectedDate,
        time: selectedTime,
      },
    });
  };

  const isSlotAvailable = (slotValue) => {
    return availableSlots.includes(slotValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-600">Step 4 of 4</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Select Date & Time
          </h1>
          <p className="text-gray-600">
            Choose your preferred appointment date and time.
          </p>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* Date Selection */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
                <Calendar size={20} className="text-red-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-3">
                <Label
                  htmlFor="date"
                  className="text-sm font-medium text-gray-700"
                >
                  Appointment Date
                </Label>
                <div className="relative max-w-xs">
                  <Input
                    id="date"
                    type="date"
                    min={minDate}
                    value={selectedDate}
                    onChange={handleDateChange}
                    className={cn(
                      "pl-4 h-11 border focus:border-red-600 focus:ring-0 rounded-lg text-sm",
                      error
                        ? "border-red-200 bg-red-50 focus:border-red-400"
                        : "border-gray-300 bg-white",
                    )}
                  />
                </div>
                {holidays.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1.5">
                      Upcoming Holidays
                    </p>
                    <div className="space-y-1">
                      {holidays.slice(0, 3).map((holiday) => (
                        <div
                          key={holiday.date}
                          className="text-xs text-blue-700 flex items-center gap-2"
                        >
                          <Calendar size={12} className="text-blue-500" />
                          <span className="font-medium">{holiday.name}</span>
                          <span className="text-blue-600">
                            (
                            {(() => {
                              const [year, month, day] =
                                holiday.date.split("-");
                              const date = new Date(year, month - 1, day);
                              return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              });
                            })()}
                            )
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          {selectedDate && !error && (
            <Card className="border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <Clock size={20} className="text-red-600" />
                    Select Time
                  </CardTitle>
                  {loadingAvailability && (
                    <div className="flex items-center gap-2 text-red-600">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span className="text-sm font-medium">
                        Loading slots...
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {timeSlots.map((slot) => {
                    const available = isSlotAvailable(slot.value);
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => available && setSelectedTime(slot.value)}
                        disabled={!available || loadingAvailability}
                        className={cn(
                          "px-2 py-3 rounded-lg border text-sm font-medium transition-all duration-200 active:scale-95",
                          selectedTime === slot.value
                            ? "border-red-600 bg-red-600 text-white shadow-md ring-1 ring-red-600"
                            : !available
                              ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                              : "border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow-sm",
                        )}
                      >
                        {slot.display}
                      </button>
                    );
                  })}
                </div>
                {!loadingAvailability && availableSlots.length === 0 && (
                  <div className="flex items-center gap-2 text-red-600 mt-6 bg-red-50 p-4 rounded-lg border border-red-100">
                    <AlertCircle size={16} />
                    <p className="text-sm font-medium">
                      No matching slots available for this operative on the
                      selected date.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-end pt-6 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-10 p-4 -mx-4 md:static md:p-0 md:bg-transparent md:border-t-0">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="px-6 h-11 border-gray-300 font-medium hover:bg-white hover:text-red-600 flex-1 md:flex-none"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime || !!error}
            className="px-8 h-11 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all duration-200 flex-1 md:flex-none"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelectionPage;
