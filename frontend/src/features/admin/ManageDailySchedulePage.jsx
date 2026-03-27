import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Unlock, Lock, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "@/components/common/DataTable";
import * as schedulerService from "@/services/scheduler.service";
import * as holidayService from "@/services/systemHoliday.service";
import { toast } from "sonner";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
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
    const time = `${hour.toString().padStart(2, "0")}:00`;
    const displayTime =
      hour < 12 ? `${hour}:00 AM` : hour === 12 ? `12:00 PM` : `${hour - 12}:00 PM`;
    slots.push({ value: time, display: displayTime });
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const ManageDailySchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data State
  const [bookings, setBookings] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState(new Set());
  
  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const seed = new Date();
    seed.setDate(seed.getDate() + 1);
    return new Date(seed.getFullYear(), seed.getMonth(), 1);
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

  const fetchDayData = async (dateStr) => {
    try {
      setLoading(true);
      // 1. Fetch active bookings for this date across the branch
      const branchSchedule = await schedulerService.getBranchDailySchedule(dateStr);
      
      // 2. Fetch partial holidays (blocked slots) for this date
      const holidayData = await holidayService.getHolidaysByRange(dateStr, dateStr);
      
      setBookings(branchSchedule || []);
      
      // Compute the slots that are blocked by holidays
      const newBlocked = new Set();
      holidayData.forEach(h => {
        if (h.starttime && h.endtime && h.holidaytype === 'custom') {
           const [sh] = h.starttime.split(":").map(Number);
           const [eh] = h.endtime.split(":").map(Number);
           for (let i = sh; i < eh; i++) {
              newBlocked.add(`${String(i).padStart(2, "0")}:00`);
           }
        }
      });
      setBlockedSlots(newBlocked);

    } catch (error) {
      console.error("Failed to load daily schedule", error);
      toast.error("Failed to load schedule for the selected date.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) fetchDayData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date) => setSelectedDate(date);

  const isSlotBooked = (slotTime) => {
    const [h, m] = slotTime.split(":").map(Number);
    const slotStart = slotTime;
    const slotEnd = `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

    // Assuming booking uses schedulestarttime and scheduleendtime logic
    return bookings.some((b) => {
      // Overlap logic: NOT (s.scheduleendtime <= slotStart OR s.schedulestarttime >= slotEnd)
      return !(b.scheduleendtime <= slotStart || b.schedulestarttime >= slotEnd);
    });
  };

  const toggleSlot = (slotValue) => {
    if (isSlotBooked(slotValue)) return; // Locked by booking
    
    setBlockedSlots(prev => {
      const copy = new Set(prev);
      if (copy.has(slotValue)) copy.delete(slotValue);
      else copy.add(slotValue);
      return copy;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Group `blockedSlots` into contiguous blocks
      const slots = Array.from(blockedSlots).map(s => Number(s.split(":")[0])).sort((a,b) => a-b);
      const blocks = [];
      
      if (slots.length > 0) {
        let currentBlock = { start: slots[0], end: slots[0] };
        
        for (let i = 1; i < slots.length; i++) {
          if (slots[i] === currentBlock.end + 1) {
            currentBlock.end = slots[i];
          } else {
            blocks.push(currentBlock);
            currentBlock = { start: slots[i], end: slots[i] };
          }
        }
        blocks.push(currentBlock);
      }
      
      const payloadBlocks = blocks.map(b => ({
         starttime: `${String(b.start).padStart(2, '0')}:00`,
         endtime: `${String(b.end + 1).padStart(2, '0')}:00`,
      }));

      await holidayService.syncDailyHolidays(selectedDate, payloadBlocks);
      toast.success("Schedule successfully updated!");
      await fetchDayData(selectedDate); // Re-fetch
    } catch (error) {
      console.error(error);
      toast.error("Failed to save branch schedule");
    } finally {
      setIsSaving(false);
    }
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
        isHoliday: false,
      });
    }
    return cells;
  }, [calendarMonth, minDate, selectedDate]);

  const headerAction = useMemo(() => (
    <Button
      onClick={handleSave}
      disabled={!selectedDate || isSaving || loading}
      className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wide rounded-lg shadow-sm"
    >
      {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
      Save Custom Schedule
    </Button>
  ), [selectedDate, isSaving, loading]);

  useSetPageHeader(
    "Operations",
    "Daily Timeslot Manager",
    "Lock down branch availability for specific timeslots.",
    headerAction
  );

  const rosterColumns = [
    { key: "time", label: "Time Slot", render: (b) => `${b.schedulestarttime.substring(0,5)} - ${b.scheduleendtime.substring(0,5)}` },
    { key: "customer", label: "Customer", render: (b) => <span className="font-medium text-gray-900">{b.customer_firstname} {b.customer_lastname}</span> },
    { key: "contact", label: "Contact Phone", render: (b) => (
      <a href={`tel:${b.customer_phone}`} className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
         <Phone size={14} className="mr-1.5" />
         {b.customer_phone || "N/A"}
      </a>
    )},
    { key: "employee", label: "Assigned To", render: (b) => b.employee_firstname ? `${b.employee_firstname} ${b.employee_lastname}` : <span className="text-gray-400 italic">Unassigned</span> },
    { key: "bookingid", label: "Booking Ref", render: (b) => <span className="text-xs text-gray-500 font-mono">#{b.bookingid}</span> },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-5 md:p-6">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] items-start">
            
            {/* Left: Calendar */}
            <div>
              <div className="mb-4">
                 <h2 className="text-sm font-bold text-gray-900 mb-1">Select Date</h2>
                 <p className="text-xs text-gray-500">Pick the date you want to adjust timeslots for.</p>
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

            {/* Right: Slot Grid Manager */}
            <div className="space-y-4">
              {!selectedDate && (
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
                  Pick a day from the calendar to view and manage time slots.
                </div>
              )}

              {loading && selectedDate && (
                <div className="flex items-center gap-2 justify-center py-12 text-gray-400">
                  <Loader2 className="animate-spin h-6 w-6" />
                  <span className="text-sm font-medium">Syncing schedule...</span>
                </div>
              )}

              {selectedDate && !loading && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                     <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Legend</p>
                     <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"/> <span className="text-xs text-gray-600">Available</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-600"/> <span className="text-xs text-gray-600">Blocked (Closed)</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"/> <span className="text-xs text-gray-600">Locked (Booked)</span></div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const booked = isSlotBooked(slot.value);
                      const isBlocked = blockedSlots.has(slot.value);
                      
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => toggleSlot(slot.value)}
                          disabled={booked}
                          className={cn(
                            "px-2 flex flex-col items-center justify-center py-2.5 rounded-lg border transition-all duration-200 active:scale-95",
                            booked 
                              ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-75"
                              : isBlocked 
                                ? "border-red-600 bg-red-600 text-white shadow-sm"
                                : "border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400 text-green-800"
                          )}
                        >
                          <span className={cn("text-xs font-bold", booked ? "text-gray-400" : "")}>{slot.display}</span>
                          <span className="text-[10px] font-medium mt-0.5 opacity-80 flex items-center gap-1">
                             {booked ? <><Lock size={10} className="inline"/> Booked</> : isBlocked ? "Blocked" : <><Unlock size={10} className="inline"/> Available</>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roster Table */}
      {selectedDate && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border border-gray-200 shadow-sm overflow-hidden mt-6">
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900">Booked Customers Roster</h2>
              <p className="text-xs text-gray-500 mt-0.5">Contact customers instantly if operational delays occur today.</p>
            </div>
            <CardContent className="p-0">
               <DataTable 
                 columns={rosterColumns}
                 data={bookings}
                 keyField="scheduleid"
                 emptyMessage="No customer bookings scheduled for this date."
               />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageDailySchedulePage;
