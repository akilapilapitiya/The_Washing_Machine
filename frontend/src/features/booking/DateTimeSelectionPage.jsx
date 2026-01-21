import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

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

// Mock availability data - in real app, this would come from API based on employee and date
const mockAvailability = {
  any: {}, // Any employee is always available
  1: { "2025-12-31": ["09:00", "10:00", "13:00", "14:00", "15:00"] },
  2: { "2025-12-31": ["09:00", "11:00", "12:00", "14:00", "16:00"] },
  3: { "2025-12-31": ["10:00", "11:00", "12:00", "13:00", "15:00"] },
  4: { "2025-12-31": ["09:00", "10:00", "11:00", "14:00", "16:00"] },
};

const DateTimeSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const { vehicleId, serviceIds, locationId, employeeId } =
    location.state || {};

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (selectedDate) {
      // For now, make all slots available as requested
      setAvailableSlots(timeSlots.map((slot) => slot.value));
    }
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleContinue = () => {
    // Navigate to confirmation/summary page
    navigate("/booking/confirmation", {
      state: {
        vehicleId,
        serviceIds,
        locationId,
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
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Book Service
          </p>
          <h1 className="text-3xl font-bold italic tracking-tight uppercase text-gray-900">
            Select date & time
          </h1>
          <p className="text-gray-600">
            Choose your preferred appointment date and time.
          </p>
        </div>

        <div className="max-w-4xl space-y-8">
          {/* Date Selection */}
          <Card className="border-2 border-transparent shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-lg font-bold uppercase italic text-gray-900">
                <Calendar size={24} className="text-red-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label
                  htmlFor="date"
                  className="text-xs uppercase font-bold tracking-wider text-gray-500"
                >
                  Appointment Date
                </Label>
                <div className="relative max-w-xs">
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="pl-4 h-12 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-mono font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          {selectedDate && (
            <Card className="border-2 border-transparent shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg font-bold uppercase italic text-gray-900">
                  <Clock size={24} className="text-red-600" />
                  Select Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {timeSlots.map((slot) => {
                    const available = isSlotAvailable(slot.value);
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => available && setSelectedTime(slot.value)}
                        disabled={!available}
                        className={cn(
                          "px-4 py-4 rounded-xl border-2 text-xs font-bold uppercase tracking-tight transition-all duration-200",
                          selectedTime === slot.value
                            ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-200"
                            : !available
                              ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50"
                              : "border-gray-100 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
                        )}
                      >
                        {slot.display}
                      </button>
                    );
                  })}
                </div>
                {availableSlots.length === 0 && (
                  <div className="flex items-center gap-2 text-red-600 mt-6 bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-sm font-bold uppercase tracking-tight">
                      No matching slots available for this date.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center pt-8 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="px-8 h-14 border-2 font-bold uppercase tracking-wide hover:bg-gray-100"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
            className="px-10 h-14 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-xl shadow-red-200 transition-all duration-300"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelectionPage;
