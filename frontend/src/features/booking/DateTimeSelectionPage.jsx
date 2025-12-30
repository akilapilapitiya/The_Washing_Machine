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
    if (selectedDate && employeeId) {
      // If "Any Employee" is selected, all slots are available
      if (employeeId === "any") {
        setAvailableSlots(timeSlots.map((slot) => slot.value));
      } else {
        // Get employee-specific availability for the selected date
        const employeeAvailability = mockAvailability[employeeId] || {};
        const dateAvailability = employeeAvailability[selectedDate] || [];

        // If no specific data, assume all slots are available
        if (Object.keys(employeeAvailability).length === 0) {
          setAvailableSlots(timeSlots.map((slot) => slot.value));
        } else {
          setAvailableSlots(dateAvailability);
        }
      }
    }
  }, [selectedDate, employeeId]);

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
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Book Service
          </p>
          <h1 className="text-3xl font-bold">Select date & time</h1>
          <p className="text-gray-600">
            Choose your preferred appointment date and time.
          </p>
        </div>

        <div className="max-w-3xl space-y-8">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar size={20} className="text-blue-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="date">Appointment Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock size={20} className="text-blue-600" />
                  Select Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {timeSlots.map((slot) => {
                    const available = isSlotAvailable(slot.value);
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => available && setSelectedTime(slot.value)}
                        disabled={!available}
                        className={cn(
                          "px-4 py-3 rounded-lg border text-sm font-medium transition",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          selectedTime === slot.value &&
                            "border-blue-500 bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-0",
                          !available &&
                            selectedTime !== slot.value &&
                            "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed",
                          available &&
                            selectedTime !== slot.value &&
                            "border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm"
                        )}
                      >
                        {slot.display}
                      </button>
                    );
                  })}
                </div>
                {availableSlots.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">
                    No available slots for this date. Please select another
                    date.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelectionPage;
