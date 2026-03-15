import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBookings } from "@/services/booking.service";
import { getAllPayments, createPayment } from "@/services/payment.service";
import * as chargesService from "@/services/charges.service";
import { printReceipt } from "@/utils/receipt";
import { toast } from "sonner";
import {
  DollarSign,
  CheckCircle,
  Plus,
  Loader2,
  Download,
  Save,
  Edit2,
  ShieldAlert,
} from "lucide-react";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import { format } from "date-fns";
import StatusBadge from "@/components/common/StatusBadge";
import PageToolbar from "@/components/common/PageToolbar";

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Credit/Debit Card" },
  { value: "online", label: "Online Payment" },
];

const ExtraItem = ({ extra, readOnly, onUpdatePrice }) => {
  const [price, setPrice] = useState(extra.price || "");
  const [isEditing, setIsEditing] = useState(!extra.price && !readOnly);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!price || isNaN(price) || Number(price) < 0) return;
    try {
      setSaving(true);
      await onUpdatePrice(Number(price));
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded border border-gray-100">
      <div>
        <p className="font-semibold text-gray-800">{extra.item_name}</p>
        {extra.description && (
          <p className="text-gray-500 scale-90 origin-left">
            {extra.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Rs.</span>
            <input
              type="number"
              className="w-16 p-1 border rounded text-right"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
            <Button
              size="icon"
              className="h-6 w-6"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Save size={10} />
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`font-mono font-medium ${!extra.price ? "text-red-500" : "text-gray-900"}`}
            >
              {extra.price ? `Rs.${extra.price}` : "Pending"}
            </span>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-gray-400 hover:text-blue-600"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={10} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentamount: "",
    paymenttype: "cash",
    paymentdate: format(new Date(), "yyyy-MM-dd"),
    bookingid: "",
  });
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookings, payments] = await Promise.all([
        getBookings(),
        getAllPayments(),
      ]);
      setPendingBookings(bookings.filter((b) => b.bookingstatus === "finished"));
      setCompletedPayments(payments);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = (booking) => {
    const extrasTotal = (booking.extras || []).reduce(
      (sum, e) => sum + (Number(e.price) || 0),
      0,
    );
    const base = Number(booking.totalprice || booking.total_price || 0);

    setSelectedBooking(booking);
    setPaymentData({
      paymentamount: (base + extrasTotal).toFixed(2),
      paymenttype: "cash",
      paymentdate: format(new Date(), "yyyy-MM-dd"),
      bookingid: booking.bookingid,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createPayment(paymentData);
      toast.success("Payment recorded successfully");
      setSelectedBooking(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const toolbar = useMemo(
    () => (
      <PageToolbar
        leftSlot={
          <div className="flex items-center gap-1 bg-gray-100/50 border border-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${
                activeTab === "pending" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Pending ({pendingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${
                activeTab === "completed" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Completed ({completedPayments.length})
            </button>
          </div>
        }
        stats={[
          { icon: DollarSign, label: "Pending", value: pendingBookings.length, iconClassName: "text-red-500" },
          { icon: CheckCircle, label: "Completed", value: completedPayments.length, iconClassName: "text-green-500" },
        ]}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={activeTab === "completed" ? "Search payments..." : "Search bookings..."}
        searchWidthClass="sm:w-72"
      />
    ),
    [activeTab, completedPayments.length, pendingBookings.length, searchQuery]
  );

  useSetPageHeader(
    "Payment Management",
    "Review Payments",
    "Manage and record customer payments for completed services.",
    null,
    toolbar
  );

  if (loading) return <PageLoader message="Loading payment information..." />;

  const isPaymentView = activeTab === "completed";

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-mono font-bold text-gray-500 text-sm">
          #{String(isPaymentView ? row.paymentid : row.bookingid).padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer & Vehicle",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm">{row.cusname || "Unregistered"}</span>
          <span className="text-xs text-gray-500 font-medium mt-0.5">
            {row.vehbrand} {row.vehmodel} • {row.vehplate}
          </span>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (row) => (
        <span className="text-sm font-medium text-gray-600">
          {row[isPaymentView ? "paymentdate" : "bookingdate"] 
            ? format(new Date(row[isPaymentView ? "paymentdate" : "bookingdate"]), "MMM d, yyyy") 
            : "N/A"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => {
        const extrasTotal = (row.extras || []).reduce((sum, e) => sum + (Number(e.price) || 0), 0);
        const baseTotal = Number(row.totalprice || row.total_price || 0);
        const displayTotal = isPaymentView ? Number(row.paymentamount) : baseTotal + extrasTotal;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">Rs.{displayTotal.toFixed(2)}</span>
            {!isPaymentView && extrasTotal > 0 && (
              <span className="text-[10px] text-orange-600 font-medium">Incl. Rs.{extrasTotal.toFixed(2)} extras</span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={isPaymentView ? "paid" : row.bookingstatus} />,
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => {
        return (
          <div className="flex justify-end gap-2">
            {isPaymentView ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-[10px] font-black uppercase text-gray-500 hover:text-gray-900 border-gray-200"
                onClick={() => printReceipt(row)}
              >
                <Download size={14} className="mr-1" /> Receipt
              </Button>
            ) : (
              <Button
                onClick={() => handleRecordPayment(row)}
                className="h-8 px-3 text-[10px] font-black uppercase bg-red-600 hover:bg-red-700 text-white"
              >
                Record Payment
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const getActiveData = () => {
    const source = isPaymentView ? completedPayments : pendingBookings;
    const query = searchQuery.trim().toLowerCase();

    if (!query) return source;

    return source.filter((row) =>
      [
        row.paymentid,
        row.bookingid,
        row.cusname,
        row.vehbrand,
        row.vehmodel,
        row.vehplate,
        row.paymenttype,
      ].some((value) => String(value || "").toLowerCase().includes(query)),
    );
  };

  const emptyProps = isPaymentView
    ? { icon: DollarSign, title: "No completed payments", subtitle: "Recorded payments will appear here." }
    : { icon: CheckCircle, title: "No pending payments", subtitle: "No completed bookings are awaiting payment." };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <DataTable
        columns={columns}
        data={getActiveData()}
        keyField={isPaymentView ? "paymentid" : "bookingid"}
        emptyIcon={emptyProps.icon}
        emptyTitle={emptyProps.title}
        emptySubtitle={searchQuery ? "No records match your search." : emptyProps.subtitle}
      />

        {/* Payment Recording Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg shadow-2xl">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <DollarSign size={24} className="text-red-600" />
                  Record Payment - BK-
                  {selectedBooking.bookingid.toString().padStart(4, "0")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  {/* Unpriced Extras Warning & Input */}
                  {(selectedBooking.extras || []).some(
                    (e) => !e.price || Number(e.price) === 0,
                  ) && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                          <ShieldAlert size={16} />
                          <span>Pending Extra Charges</span>
                        </div>
                        <p className="text-xs text-orange-600">
                          The following items must be priced before recording
                          payment.
                        </p>

                        <div className="space-y-2">
                          {selectedBooking.extras
                            .filter((e) => !e.price || Number(e.price) === 0)
                            .map((extra) => (
                              <div
                                key={extra.id}
                                className="flex items-center justify-between bg-white p-2 rounded border border-orange-100"
                              >
                                <span className="text-sm font-medium text-gray-700">
                                  {extra.item_name}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-400">
                                    Rs.
                                  </span>
                                  <input
                                    type="number"
                                    className="w-20 p-1 text-right text-sm border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="0.00"
                                    onBlur={async (e) => {
                                      const val = parseFloat(e.target.value);
                                      if (val > 0) {
                                        try {
                                          await chargesService.updateItemPrice(
                                            extra.id,
                                            val,
                                          );
                                          toast.success(
                                            `Price updated for ${extra.item_name}`,
                                          );

                                          // Update local state to reflect change and recalculate total
                                          setSelectedBooking((prev) => {
                                            const newExtras = prev.extras.map(
                                              (x) =>
                                                x.id === extra.id
                                                  ? { ...x, price: val }
                                                  : x,
                                            );
                                            const newExtrasTotal =
                                              newExtras.reduce(
                                                (sum, item) =>
                                                  sum + (Number(item.price) || 0),
                                                0,
                                              );
                                            const base = Number(
                                              prev.totalprice ||
                                              prev.total_price ||
                                              0,
                                            );

                                            // Construct new object
                                            const updated = {
                                              ...prev,
                                              extras: newExtras,
                                            };

                                            // Update payment amount input automatically
                                            setPaymentData((d) => ({
                                              ...d,
                                              paymentamount: (
                                                base + newExtrasTotal
                                              ).toFixed(2),
                                            }));

                                            return updated;
                                          });
                                          // Also trigger main data refresh in background
                                          fetchData();
                                        } catch (err) {
                                          console.error(
                                            "Failed to update price",
                                            err,
                                          );
                                          toast.error("Failed to update price");
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Payment Summary */}
                  <div className="bg-red-50 rounded-lg p-4 space-y-2 border border-red-100">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm font-medium">
                        Booking Date
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {new Date(
                          selectedBooking.bookingdate,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="border-t border-red-200 pt-2 flex justify-between">
                      <span className="text-gray-800 font-bold">
                        Total Amount Due
                      </span>
                      <span className="text-xl font-black text-red-600">
                        Rs.
                        {(
                          Number(
                            selectedBooking.totalprice ||
                            selectedBooking.total_price ||
                            0,
                          ) +
                          (selectedBooking.extras || []).reduce(
                            (sum, e) => sum + (Number(e.price) || 0),
                            0,
                          )
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentamount">
                      Confirm Amount (Rs.) *
                    </Label>
                    <Input
                      id="paymentamount"
                      name="paymentamount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={paymentData.paymentamount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="paymenttype">Payment Method *</Label>
                    <select
                      id="paymenttype"
                      name="paymenttype"
                      value={paymentData.paymenttype}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                      required
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentdate">Payment Date *</Label>
                    <Input
                      id="paymentdate"
                      name="paymentdate"
                      type="date"
                      value={paymentData.paymentdate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedBooking(null)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        submitting ||
                        (selectedBooking.extras || []).some(
                          (e) => !e.price || Number(e.price) === 0,
                        )
                      }
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold min-w-[140px]"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      Confirm Payment
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

export default PaymentManagementPage;
