import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Bell,
  Calendar,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import * as settingsService from "@/services/settings.service";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

const ServiceReminderSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      default_service_frequency_days: 90,
      service_reminder_prior_days: 7,
    },
  });

  const formValues = watch();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getReminderSettings();
      setValue("default_service_frequency_days", data.default_service_frequency_days);
      setValue("service_reminder_prior_days", data.service_reminder_prior_days);
    } catch (error) {
      console.error("Failed to fetch reminder settings:", error);
      toast.error("Could not load reminder settings.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await settingsService.updateReminderSettings(data);
      toast.success("Reminder settings updated successfully!");
    } catch (error) {
      console.error("Failed to update reminder settings:", error);
      toast.error("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useSetPageHeader(
    "System Settings",
    "Service Reminders",
    "Configure automated service reminder intervals and notification timing.",
  );

  if (loading) return <PageLoader message="Loading reminder settings..." />;

  // Compute a human-readable example for the info cards
  const freqDays = formValues.default_service_frequency_days || 90;
  const leadDays = formValues.service_reminder_prior_days || 7;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column: Config Form */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-700" />
                Reminder Configuration
              </CardTitle>
              <CardDescription>
                Set the default service interval and how early notifications are
                dispatched to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default_service_frequency_days">
                    Default Service Interval (Days)
                  </Label>
                  <p className="text-xs text-gray-500">
                    The default number of days between services. Used for new
                    customers without enough service history.
                  </p>
                  <Input
                    id="default_service_frequency_days"
                    type="number"
                    min="1"
                    {...register("default_service_frequency_days", {
                      required: "Required",
                      min: { value: 1, message: "Must be at least 1 day" },
                      valueAsNumber: true,
                    })}
                  />
                  {errors.default_service_frequency_days && (
                    <span className="text-xs text-red-500">
                      {errors.default_service_frequency_days.message}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_reminder_prior_days">
                    Notification Lead Time (Days)
                  </Label>
                  <p className="text-xs text-gray-500">
                    How many days before the next service due date the system
                    should flag the vehicle and allow dispatching reminders.
                  </p>
                  <Input
                    id="service_reminder_prior_days"
                    type="number"
                    min="0"
                    {...register("service_reminder_prior_days", {
                      required: "Required",
                      min: { value: 0, message: "Cannot be negative" },
                      valueAsNumber: true,
                    })}
                  />
                  {errors.service_reminder_prior_days && (
                    <span className="text-xs text-red-500">
                      {errors.service_reminder_prior_days.message}
                    </span>
                  )}
                </div>

                <Separator className="my-4" />

                <Button
                  type="submit"
                  className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                  disabled={saving}
                >
                  {saving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {saving ? "Saving..." : "Save Configuration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Info Cards */}
        <div className="space-y-6">
          {/* Timeline Preview */}
          <Card className="bg-gray-50/50 border-dashed border-2 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Timeline Preview
              </CardTitle>
              <CardDescription>
                See how your settings translate into real-world timing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gray-300" />

                {/* Last Service */}
                <div className="flex items-start gap-4 pb-6">
                  <div className="h-7 w-7 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center flex-shrink-0 z-10">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Last Service Completed
                    </p>
                    <p className="text-xs text-gray-500">Day 0 — Starting Point</p>
                  </div>
                </div>

                {/* Reminder sent */}
                <div className="flex items-start gap-4 pb-6">
                  <div className="h-7 w-7 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center flex-shrink-0 z-10">
                    <Bell className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Reminder Dispatched
                    </p>
                    <p className="text-xs text-gray-500">
                      Day {freqDays - leadDays} — {leadDays} days before due date
                    </p>
                  </div>
                </div>

                {/* Service Due */}
                <div className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center flex-shrink-0 z-10">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Next Service Due
                    </p>
                    <p className="text-xs text-gray-500">
                      Day {freqDays} — Customer should book by now
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Summary
                </p>
                <div className="text-xs text-gray-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Service Interval:</span>
                    <span className="font-semibold text-gray-900">
                      Every {freqDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reminder Sent:</span>
                    <span className="font-semibold text-gray-900">
                      {leadDays} days before due
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Notification Window:</span>
                    <span className="font-semibold text-blue-600">
                      Day {freqDays - leadDays} → Day {freqDays}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4 text-sm text-gray-700">
              <p className="font-semibold mb-1 text-gray-900">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  The <strong>Service Interval</strong> determines the default gap
                  between services for customers without enough history.
                </li>
                <li>
                  The <strong>Lead Time</strong> controls when a vehicle appears
                  as "Due Soon" in the Service Reminders dashboard.
                </li>
                <li>
                  Vehicles past their due date are flagged as <strong>Overdue</strong>.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceReminderSettingsPage;
