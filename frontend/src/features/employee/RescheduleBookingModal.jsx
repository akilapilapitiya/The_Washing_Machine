import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, X, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import * as bookingService from "@/services/booking.service";
import * as schedulerService from "@/services/scheduler.service";
import * as holidayService from "@/services/systemHoliday.service";
import BookingAvailabilityCalendar from "@/components/common/BookingAvailabilityCalendar";

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 16; hour++) {
    for (let min of [0, 15, 30, 45]) {
      if (hour === 16 && min > 30) continue; 
      const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
      let displayTime;
      if (hour < 12) {
        displayTime = `${hour}:${min === 0 ? "00" : min} AM`;
      } else if (hour === 12) {
        displayTime = `12:${min === 0 ? "00" : min} PM`;
      } else {
        displayTime = `${hour - 12}:${min === 0 ? "00" : min} PM`;
      }
      slots.push({ value: time, display: displayTime });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const RescheduleBookingModal = ({ booking, onClose, onRescheduled }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [scheduleArray, setScheduleArray] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    return new Date();
  });

  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return date;
  }, []);
  const minDate = useMemo(() => toDateKey(tomorrow), [tomorrow]);

  const monthLabel = useMemo(
    () =>
      calendarMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [calendarMonth]
  );

  useEffect(() => {
    if (!selectedDate) return;
    
    let isMounted = true;
    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        setSelectedTime(null);
        
        let existingSchedules = [];
        
        // If an employee is assigned, fetch their schedule to avoid overlaps
        if (booking.empid) {
           existingSchedules = await schedulerService.getEmployeeScheduleByDate(booking.empid, selectedDate);
        } else {
           existingSchedules = await schedulerService.getBranchDailySchedule(selectedDate);
        }
        
        const partialHolidays = await holidayService.getHolidaysByRange(selectedDate, selectedDate);
        
        if (!isMounted) return;
        
        // Filter out the *current* booking from the schedule array so it doesn't block its own slot
        setScheduleArray(existingSchedules ? existingSchedules.filter(s => s.bookingid !== booking.bookingid) : []);
        setHolidays(partialHolidays || []);

      } catch (err) {
        console.error("Failed to load availability:", err);
        if (isMounted) toast.error("Could not fetch timeslot availability.");
      } finally {
        if (isMounted) setLoadingAvailability(false);
      }
    };
    fetchAvailability();
    return () => { isMounted = false; };
  }, [selectedDate, booking.empid, booking.bookingid]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const isSlotBooked = (slotTime) => {
    const slotStart = `${slotTime}:00`;
    const [h, m] = slotTime.split(":").map(Number);
    
    // Estimate a 60-minute duration block for checking
    const totalMinutes = h * 60 + m + 60;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    const slotEnd = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;

    const isOverlapping = scheduleArray.some((entry) => {
      return !(entry.scheduleendtime <= slotStart || entry.schedulestarttime >= slotEnd);
    }) || holidays.some((holiday) => {
      if (holiday.holidaytype === 'full') return true;
      if (holiday.startTime && holiday.endTime) {
         return !(holiday.endTime <= slotStart || holiday.startTime >= slotEnd);
      }
      return false;
    });

    return isOverlapping;
  };

  const calendarDays = useMemo(() => {
    const firstDateOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const firstWeekDay = firstDateOfMonth.getDay();
    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekDay; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
      const dateKey = toDateKey(date);
      cells.push({
        day,
        dateKey,
        isDisabled: dateKey < minDate,
        isSelected: selectedDate === dateKey,
        isHoliday: false, // Could expand this to fetch full month holidays
      });
    }
    return cells;
  }, [calendarMonth, minDate, selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;
    try {
       setIsSubmitting(true);
       await bookingService.rescheduleBooking(booking.bookingid, selectedDate, `${selectedTime}:00`);
       toast.success("Service rescheduled successfully!");
       if (onRescheduled) onRescheduled();
       onClose();
    } catch (err) {
       console.error(err);
       toast.error(err.response?.data?.message || "Failed to reschedule booking");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl shadow-2xl border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
             <Calendar size={16} className="text-red-600" /> Administrative Rescheduling
          </CardTitle>
          <X className="cursor-pointer text-gray-400 hover:text-gray-900 transition-colors" size={18} onClick={onClose} />
        </div>
        
        <CardContent className="p-0 flex-1 overflow-y-auto">
           <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 min-h-0">
             {/* Left: Calendar */}
             <div className="p-6 bg-white">
                <div className="mb-4">
                   <h3 className="text-sm font-bold text-gray-900">Select New Date</h3>
                   <p className="text-xs text-gray-500">Only future operational dates are permitted.</p>
                </div>
                <BookingAvailabilityCalendar
                  monthLabel={monthLabel}
                  calendarDays={calendarDays}
                  isPrevMonthDisabled={calendarMonth <= new Date(minDate)}
                  onPrevMonth={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  onNextMonth={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  onDateSelect={handleDateChange}
                  selectedDate={selectedDate}
                />
             </div>

             {/* Right: Time Slots */}
             <div className="p-6 bg-gray-50/50">
                <div className="mb-4">
                   <h3 className="text-sm font-bold text-gray-900">Select Arrival Time</h3>
                   <p className="text-xs text-gray-500">Timeslots are filtered against existing resource constraints.</p>
                </div>
                
                {!selectedDate ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                     <Clock className="h-8 w-8 mb-3 opacity-20" />
                     <p className="text-sm font-medium">Please select a date first</p>
                  </div>
                ) : loadingAvailability ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                     <Loader2 className="h-8 w-8 mb-3 animate-spin text-red-600/50" />
                     <p className="text-sm font-medium">Syncing master schedule...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-200">
                    {TIME_SLOTS.map((slot) => {
                       const isBooked = isSlotBooked(slot.value);
                       const isSelected = selectedTime === slot.value;
                       return (
                          <button
                            key={slot.value}
                            disabled={isBooked}
                            onClick={() => setSelectedTime(slot.value)}
                            className={cn(
                              "relative flex flex-col items-center justify-center py-2.5 rounded-lg border transition-all duration-200 outline-none",
                              isBooked 
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70"
                                : isSelected
                                  ? "bg-red-600 border-red-600 text-white shadow-md scale-[1.02] ring-2 ring-red-600 ring-offset-1"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            )}
                          >
                            <span className="text-xs font-bold font-mono tracking-tight">{slot.display}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-80 flex items-center justify-center w-full">
                               {isBooked ? "Unavailable" : "Available"}
                            </span>
                          </button>
                       )
                    })}
                  </div>
                )}
             </div>
           </div>
        </CardContent>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0">
           <Button variant="ghost" onClick={onClose} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900">
             Cancel
           </Button>
           <Button 
             onClick={handleSubmit} 
             disabled={!selectedDate || !selectedTime || isSubmitting}
             className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wide rounded-lg shadow-sm w-36"
           >
             {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Confirm Action"}
           </Button>
        </div>
      </Card>
    </div>
  );
};

export default RescheduleBookingModal;
