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
  Clock,
} from "lucide-react";
import * as holidayService from "@/services/systemHoliday.service";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import PageToolbar from "@/components/common/PageToolbar";
import { cn } from "@/lib/utils";

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

const TIME_SLOTS = generateTimeSlots();

const SystemHolidaysPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();

  const [isPartialDay, setIsPartialDay] = useState(false);
  const [formData, setFormData] = useState({
    holidayname: "",
    holidaydate: "",
    starttime: "",
    endtime: "",
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

  const getSelectedSlots = () => {
    if (!formData.starttime || !formData.endtime) return [];
    const sh = Number(formData.starttime.split(":")[0]);
    const eh = Number(formData.endtime.split(":")[0]);
    const slots = [];
    for (let i = sh; i < eh; i++) {
      slots.push(`${String(i).padStart(2, "0")}:00`);
    }
    return slots;
  };

  const handleSlotToggle = (val) => {
    const currentSlots = getSelectedSlots();
    let newSlots;

    if (currentSlots.includes(val)) {
      newSlots = currentSlots.filter((s) => s !== val);
    } else {
      newSlots = [...currentSlots, val];
    }

    if (newSlots.length === 0) {
      setFormData((prev) => ({ ...prev, starttime: "", endtime: "" }));
    } else {
      const mapped = newSlots
        .map((s) => Number(s.split(":")[0]))
        .sort((a, b) => a - b);
      const min = mapped[0];
      const max = mapped[mapped.length - 1];
      setFormData((prev) => ({
        ...prev,
        starttime: `${String(min).padStart(2, "0")}:00`,
        endtime: `${String(max + 1).padStart(2, "0")}:00`,
      }));
    }
  };

  const resetForm = React.useCallback(() => {
    setIsPartialDay(false);
    setFormData({
      holidayname: "",
      holidaydate: "",
      starttime: "",
      endtime: "",
      holidaytype: "public",
      description: "",
      is_recurring: false,
    });
  }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { ...formData };
      if (!isPartialDay) {
        delete payload.starttime;
        delete payload.endtime;
      }
      await holidayService.createHoliday(payload);
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
      const payload = { ...formData };
      if (!isPartialDay) {
        delete payload.starttime;
        delete payload.endtime;
      }
      await holidayService.updateHoliday(selectedHoliday.holidayid, payload);
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
    const hasTime = !!holiday.starttime && !!holiday.endtime;
    setIsPartialDay(hasTime);
    setFormData({
      holidayname: holiday.holidayname,
      holidaydate: holiday.holidaydate.split("T")[0], // Use date string directly
      starttime: hasTime ? holiday.starttime.substring(0, 5) : "",
      endtime: hasTime ? holiday.endtime.substring(0, 5) : "",
      holidaytype: holiday.holidaytype,
      description: holiday.description || "",
      is_recurring: holiday.is_recurring || false,
    });
    setShowEditForm(true);
  };

  const openAddForm = React.useCallback(() => {
    resetForm();
    setShowAddForm(true);
  }, [resetForm]);

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

  // Memoize action button for stable reference
  const headerAction = React.useMemo(
    () => (
      <Button
        onClick={openAddForm}
        className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wide rounded-lg shadow-sm"
      >
        <Plus size={18} />
        Add Holiday
      </Button>
    ),
    [openAddForm],
  );

  const filteredHolidays = holidays.filter((holiday) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      !query ||
      [
        holiday.holidayname,
        holiday.holidaytype,
        holiday.description,
        holiday.holidaydate,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      )
    );
  });

  const toolbar = React.useMemo(
    () => (
      <PageToolbar
        stats={[
          {
            icon: Calendar,
            label: "Total",
            value: holidays.length,
            iconClassName: "text-red-500",
          },
          {
            icon: Tag,
            label: "Public",
            value: holidays.filter(
              (holiday) => holiday.holidaytype === "public",
            ).length,
            iconClassName: "text-blue-500",
          },
          {
            icon: Tag,
            label: "Company",
            value: holidays.filter(
              (holiday) => holiday.holidaytype === "company",
            ).length,
            iconClassName: "text-purple-500",
          },
          {
            icon: Tag,
            label: "Recurring",
            value: holidays.filter((holiday) => holiday.is_recurring).length,
            iconClassName: "text-gray-500",
          },
        ]}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search holidays..."
      />
    ),
    [holidays, searchQuery],
  );

  useSetPageHeader(
    "System Settings",
    "System Holidays",
    "Manage company-wide holidays and closures. Bookings are automatically blocked on these dates.",
    headerAction,
    toolbar,
  );

  if (loading) return <PageLoader message="Loading holidays..." />;

  const columns = [
    {
      key: "date",
      label: "Date & Time",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="font-medium text-gray-900">
              {formatDate(row.holidaydate)}
            </span>
          </div>
          {row.starttime && row.endtime && (
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Clock size={12} className="text-gray-400" />
              <span>
                {row.starttime.substring(0, 5)} - {row.endtime.substring(0, 5)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "holidayname",
      label: "Holiday Name",
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.holidayname}</span>
      ),
    },
    {
      key: "holidaytype",
      label: "Type",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getHolidayTypeColor(
            row.holidaytype,
          )}`}
        >
          {row.holidaytype}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-sm text-gray-600 line-clamp-1">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditForm(row)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Edit Holiday"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteHoliday(row.holidayid, row.holidayname)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Holiday"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <ConfirmDialog />
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <DataTable
          columns={columns}
          data={filteredHolidays}
          keyField="holidayid"
          emptyIcon={Calendar}
          emptyTitle="No holidays configured"
          emptySubtitle="Add your first system holiday to block bookings on specific dates."
          emptyAction={
            <Button
              onClick={openAddForm}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus size={16} className="mr-2" />
              Add Holiday
            </Button>
          }
        />
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPartialDay"
                    checked={isPartialDay}
                    onChange={(e) => setIsPartialDay(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer"
                  />
                  <Label
                    htmlFor="isPartialDay"
                    className="cursor-pointer text-sm"
                  >
                    Partial Day Closure (Specific Hours)
                  </Label>
                </div>

                {isPartialDay && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        Select Timeframes to Remove
                      </Label>
                      {formData.starttime && formData.endtime && (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {formData.starttime.substring(0, 5)} -{" "}
                          {formData.endtime.substring(0, 5)}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = getSelectedSlots().includes(
                          slot.value,
                        );
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            onClick={() => handleSlotToggle(slot.value)}
                            className={cn(
                              "px-2 py-2 rounded-lg border text-xs font-bold transition-all duration-200 active:scale-95",
                              isSelected
                                ? "border-red-600 bg-red-600 text-white shadow-sm"
                                : "border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600",
                            )}
                          >
                            {slot.display}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Holiday Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["public", "company", "custom"].map((type) => (
                      <label
                        key={type}
                        className={`flex items-center justify-center gap-2 border p-3 rounded-lg cursor-pointer transition-all ${
                          formData.holidaytype === type
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
                          className={`text-xs font-semibold uppercase ${
                            formData.holidaytype === type
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
