import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Edit,
  X,
  Calendar,
  Loader2,
  Tag,
  AlertCircle,
} from "lucide-react";
import * as holidayService from "@/services/systemHoliday.service";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

const SystemHolidaysPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();

  const [formData, setFormData] = useState({
    holidayname: "",
    holidaydate: "",
    holidaytype: "public",
    description: "",
    is_recurring: false,
  });

  // Get today's date for min date validation
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const data = await holidayService.getHolidays();
      setHolidays(data);
    } catch (err) {
      toast.error(err.message || "Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      holidayname: "",
      holidaydate: "",
      holidaytype: "public",
      description: "",
      is_recurring: false,
    });
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await holidayService.createHoliday(formData);
      resetForm();
      setShowAddForm(false);
      toast.success("Holiday added successfully");
      await fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add holiday");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditHoliday = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await holidayService.updateHoliday(selectedHoliday.holidayid, formData);
      resetForm();
      setShowEditForm(false);
      setSelectedHoliday(null);
      toast.success("Holiday updated successfully");
      await fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update holiday");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (holidayid, holidayname) => {
    const confirmed = await confirm({
      variant: "destructive",
      title: "Delete Holiday?",
      description: `Are you sure you want to delete "${holidayname}"? This action cannot be undone.`,
      confirmText: "Delete Holiday",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await holidayService.deleteHoliday(holidayid);
      toast.success("Holiday deleted successfully");
      await fetchHolidays();
    } catch (err) {
      toast.error(err.message || "Failed to delete holiday");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditForm = (holiday) => {
    setSelectedHoliday(holiday);
    setFormData({
      holidayname: holiday.holidayname,
      holidaydate: holiday.holidaydate.split("T")[0], // Use date string directly
      holidaytype: holiday.holidaytype,
      description: holiday.description || "",
      is_recurring: holiday.is_recurring || false,
    });
    setShowEditForm(true);
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const getHolidayTypeColor = (type) => {
    switch (type) {
      case "public":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "company":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "custom":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    // Parse date string as local date to avoid timezone issues
    const [year, month, day] = dateString.split("T")[0].split("-");
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useSetPageHeader(
    "System Settings",
    "System Holidays",
    "Manage company-wide holidays and closures. Bookings are automatically blocked on these dates.",
    <Button
      onClick={openAddForm}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white h-10 px-4 rounded-lg shadow-sm"
    >
      <Plus size={18} />
      Add Holiday
    </Button>
  );

  if (loading) return <PageLoader message="Loading holidays..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ConfirmDialog />
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {holidays.length > 0 ? (
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-[10px]">
                      Date
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-[10px]">
                      Holiday Name
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-[10px]">
                      Type
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-[10px]">
                      Description
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-[10px] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-600">
                  {holidays.map((holiday) => (
                    <tr
                      key={holiday.holidayid}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatDate(holiday.holidaydate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {holiday.holidayname}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getHolidayTypeColor(holiday.holidaytype)}`}
                        >
                          {holiday.holidaytype}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 line-clamp-1">
                          {holiday.description || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(holiday)}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                            title="Edit Holiday"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteHoliday(
                                holiday.holidayid,
                                holiday.holidayname,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Holiday"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-white">
            <div className="p-4 bg-gray-50 rounded-full w-max mx-auto mb-4">
              <Calendar size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No holidays configured
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Add your first system holiday to block bookings on specific dates.
            </p>
            <Button
              onClick={openAddForm}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus size={16} className="mr-2" />
              Add Holiday
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-0">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  {showAddForm ? (
                    <>
                      <div className="p-2 bg-red-50 rounded-lg">
                        <Plus size={20} className="text-red-600" />
                      </div>
                      Add Holiday
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <Edit size={20} className="text-gray-700" />
                      </div>
                      Edit Holiday
                    </>
                  )}
                </CardTitle>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                  }}
                  disabled={isSubmitting}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form
                onSubmit={showAddForm ? handleAddHoliday : handleEditHoliday}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="holidayname"
                    className="text-sm font-medium text-gray-700"
                  >
                    Holiday Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="holidayname"
                    name="holidayname"
                    value={formData.holidayname}
                    onChange={handleInputChange}
                    placeholder="e.g., Christmas Day"
                    className="h-11 border-gray-300 focus:ring-red-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="holidaydate"
                    className="text-sm font-medium text-gray-700"
                  >
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="holidaydate"
                    name="holidaydate"
                    type="date"
                    value={formData.holidaydate}
                    onChange={handleInputChange}
                    min={today}
                    className="h-11 border-gray-300 focus:ring-red-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Holiday Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["public", "company", "custom"].map((type) => (
                      <label
                        key={type}
                        className={`flex items-center justify-center gap-2 border p-3 rounded-lg cursor-pointer transition-all ${formData.holidaytype === type
                            ? "border-red-600 bg-red-50/50 ring-1 ring-red-600"
                            : "border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name="holidaytype"
                          value={type}
                          checked={formData.holidaytype === type}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span
                          className={`text-xs font-semibold uppercase ${formData.holidaytype === type
                              ? "text-red-900"
                              : "text-gray-600"
                            }`}
                        >
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none text-sm transition-shadow"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle
                    size={20}
                    className="text-yellow-600 shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Booking Restriction</p>
                    <p className="text-yellow-700">
                      Customers will not be able to book services on this date.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setShowEditForm(false);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-11 bg-red-600 hover:bg-red-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : showAddForm ? (
                      "Add Holiday"
                    ) : (
                      "Update Holiday"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemHolidaysPage;
