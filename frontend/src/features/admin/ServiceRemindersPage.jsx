import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Bell,
  Search,
  Calendar,
  Car,
  ChevronRight,
  AlertTriangle,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import * as vehicleService from "@/services/vehicle.service";
import * as settingsService from "@/services/settings.service";

const ServiceRemindersPage = () => {
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [settings, setSettings] = useState({ service_reminder_prior_days: 7 });
  const [sendingId, setSendingId] = useState(null);

  useSetPageHeader(
    "Service Reminders",
    "Customer Notifications",
    "Monitor upcoming vehicle maintenance and dispatch reminder emails manually."
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remindersData, settingsData] = await Promise.all([
        vehicleService.getServiceReminders(),
        settingsService.getReminderSettings().catch(() => ({ service_reminder_prior_days: 7 }))
      ]);
      setReminders(remindersData.reminders || []);
      setSettings(settingsData);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
      toast.error("Failed to load service reminders.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (vehicleId) => {
    try {
      setSendingId(vehicleId);
      await vehicleService.sendServiceReminder(vehicleId);
      toast.success("Reminder email dispatched successfully!");
    } catch (error) {
      console.error("Failed to send reminder:", error);
      toast.error("Failed to dispatch the reminder.");
    } finally {
      setSendingId(null);
    }
  };

  const getStatusInfo = (dateStr) => {
    const dueDate = new Date(dateStr);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)} days`, color: "bg-red-100 text-red-800 border-red-200" };
    } else if (diffDays <= settings.service_reminder_prior_days) {
      return { label: `Due in ${diffDays} days`, color: "bg-amber-100 text-amber-800 border-amber-200" };
    } else {
      return { label: `Upcoming (${diffDays} days left)`, color: "bg-green-100 text-green-800 border-green-200" };
    }
  };

  const filteredReminders = reminders.filter((r) => {
    const search = searchTerm.toLowerCase();
    return (
      r.vehplate?.toLowerCase().includes(search) ||
      r.vehbrand?.toLowerCase().includes(search) ||
      r.cusname?.toLowerCase().includes(search) ||
      r.cusemail?.toLowerCase().includes(search)
    );
  });

  if (loading) return <PageLoader message="Loading service queue..." />;

  return (
    <div className="container mx-auto p-6 max-w-7xl animate-in fade-in zoom-in-95 duration-300">
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell className="h-5 w-5 text-red-600" />
                Due Vehicles
              </CardTitle>
              <CardDescription>
                List of vehicles scheduled for upcoming maintenance based on interval calculations.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search plate or customer..."
                  className="pl-9 h-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Customer Info</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Vehicle Details</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Mileage Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Due Date</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReminders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <Car className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-sm font-medium">No vehicles found</p>
                        <p className="text-xs mt-1">Try adjusting your search filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReminders.map((reminder) => {
                    const status = getStatusInfo(reminder.next_service_date);
                    return (
                      <tr
                        key={reminder.vehicle_id}
                        className="hover:bg-red-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                              {reminder.cusname?.charAt(0) || "C"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {reminder.cusname}
                              </p>
                              <p className="text-xs text-gray-500">{reminder.cusemail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-1.5">
                              {reminder.vehplate}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {reminder.vehbrand} {reminder.vehmodel}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Current:</span>
                              <span className="font-semibold">{reminder.vehmileage?.toLocaleString()} km</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Target:</span>
                              <span className="font-semibold text-red-600">{reminder.next_service_mileage?.toLocaleString()} km</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5 font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {new Date(reminder.next_service_date).toLocaleDateString()}
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => handleSendReminder(reminder.vehicle_id)}
                            disabled={sendingId === reminder.vehicle_id}
                            variant="outline"
                            size="sm"
                            className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 shadow-sm"
                          >
                            {sendingId === reminder.vehicle_id ? (
                              <span className="flex items-center gap-2">
                                <span className="h-3 w-3 block rounded-full border-2 border-t-red-600 border-r-transparent border-b-red-600 border-l-transparent animate-spin"/>
                                Sending...
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <Mail className="h-4 w-4" />
                                Notify
                              </span>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceRemindersPage;
