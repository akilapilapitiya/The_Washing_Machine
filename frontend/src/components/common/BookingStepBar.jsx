import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Services" },
  { label: "Location" },
  { label: "Date & Time" },
  { label: "Employee" },
  { label: "Confirm" },
];

/**
 * BookingStepBar — visual progress indicator for the booking flow.
 * @param {number} currentStep — 1-indexed current step (1 = Services, 5 = Confirm)
 */
const BookingStepBar = ({ currentStep }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-red-600 z-0 transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div
              key={step.label}
              className="flex flex-col items-center gap-2 relative z-10"
            >
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-red-600 border-red-600 text-white"
                    : isActive
                      ? "bg-white border-red-600 text-red-600 shadow-sm shadow-red-100 ring-4 ring-red-50"
                      : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? <Check size={14} /> : stepNumber}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block ${
                  isActive
                    ? "text-red-600"
                    : isCompleted
                      ? "text-gray-600"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepBar;
