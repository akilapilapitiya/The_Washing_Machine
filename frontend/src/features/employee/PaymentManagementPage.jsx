import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Credit/Debit Card" },
  { value: "online", label: "Online Payment" },
];

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    inProgress: "bg-blue-50 text-blue-700 border-blue-100",
    completed: "bg-purple-50 text-purple-700 border-purple-100",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  const labels = {
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    paid: "Paid",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}
    >
      {labels[status] || status}
    </span>
  );
};

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

const PaymentCard = ({ item, onRecordPayment, isPayment, onRefresh }) => {
  // item is either a booking (pending payment) or a payment object (completed)
  const bookingId = isPayment ? item.bookingid : item.bookingid;
  const status = isPayment ? "paid" : item.bookingstatus;
  const brand = item.vehbrand || "Vehicle";
  const model = item.vehmodel || "";
  const plate = item.vehplate || "";
  const customerName = item.cusname || "Customer";

  // Calculate total amount
  // If isPayment, use recorded payment amount.
  // If pending, calculate base + extras.
  const services = item.services || [];
  const extras = item.extras || [];

  // Calculate extras total from items that have a valid price
  const extrasTotal = extras.reduce(
    (sum, e) => sum + (Number(e.price) || 0),
    0,
  );

  // Base total from booking record (services + travel cost)
  // Assuming item.totalprice is the database stored total.
  const baseTotal = Number(item.totalprice || item.total_price || 0);

  // For display:
  // If paid, show what was paid.
  // If pending, show projected total (Base + Extras).
  const displayTotal = isPayment
    ? Number(item.paymentamount)
    : baseTotal + extrasTotal;

  const date = isPayment ? item.paymentdate : item.bookingdate;

  return (
    <Card className="flex flex-col h-full bg-white shadow-sm border-gray-200">
      <CardHeader className="pb-3 border-b border-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900">
              BK-{bookingId.toString().padStart(4, "0")}
            </CardTitle>
            <p className="text-sm text-gray-500 font-medium">
              {brand} {model} <span className="text-gray-300">|</span> {plate}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-2 rounded-md">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
              Customer
            </p>
            <p
              className="text-sm font-semibold text-gray-900 truncate"
              title={customerName}
            >
              {customerName}
            </p>
          </div>
          <div className="bg-gray-50 p-2 rounded-md">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
              Date
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {/* Services List */}
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              Services
            </p>
            <div className="flex flex-wrap gap-1.5">
              {services.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-700 text-[11px] px-2 py-1 rounded font-medium border border-blue-100"
                >
                  {typeof s === "string" ? s : s.serviceName || s.servicename}
                </span>
              ))}
              {services.length === 0 && (
                <span className="text-xs text-gray-400 italic">
                  No services listed
                </span>
              )}
            </div>
          </div>

          {/* Extras List */}
          {extras.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                Extra Items
              </p>
              <div className="space-y-1.5">
                {extras.map((extra) => (
                  <ExtraItem
                    key={extra.id}
                    extra={extra}
                    readOnly={isPayment}
                    onUpdatePrice={async (price) => {
                      await chargesService.updateItemPrice(extra.id, price);
                      toast.success("Price updated");
                      if (onRefresh) onRefresh();
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mt-auto border border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {isPayment ? "Amount Paid" : "Total Due"}
            </span>
            <span className="text-xl font-bold text-gray-900">
              Rs.{displayTotal.toFixed(2)}
            </span>
          </div>
          {!isPayment && extrasTotal > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-medium">
                Includes Rs.{extrasTotal.toFixed(2)} extra charges
              </p>
            </div>
          )}
        </div>

        {isPayment && item.paymenttype && (
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Payment Method
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-sm font-medium capitalize text-gray-900">
                {item.paymenttype}
              </p>
            </div>
          </div>
        )}

        {isPayment && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-dashed h-9 text-xs"
              onClick={() => printReceipt(item)}
            >
              <Download size={14} /> Print Receipt
            </Button>
          </div>
        )}

        {!isPayment && (
          <Button
            onClick={() => onRecordPayment(item)}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold h-10 transition-all"
          >
            <Plus size={16} />
            Record Payment
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const PaymentManagementPage = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentamount: "",
    paymenttype: "",
    paymentdate: new Date().toISOString().split("T")[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      toast.dismiss();
      const [bookingsData, paymentsData] = await Promise.all([
        getBookings(),
        getAllPayments(),
      ]);

      // Filter bookings that are completed but not yet paid
      // We know they aren't paid because there's no payment record joined or status is 'completed'
      const pending = bookingsData.filter(
        (b) => b.bookingstatus === "completed",
      );
      setPendingBookings(pending);
      setCompletedPayments(paymentsData);
    } catch (err) {
      console.error("Error fetching payment data:", err);
      toast.error(
        "Failed to load payment information. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordPayment = (booking) => {
    setSelectedBooking(booking);
    const extrasTotal = (booking.extras || []).reduce(
      (sum, e) => sum + (Number(e.price) || 0),
      0,
    );
    const baseTotal = Number(booking.totalprice || booking.total_price || 0);

    setPaymentData({
      paymentamount: (baseTotal + extrasTotal).toFixed(2),
      paymenttype: "cash",
      paymentdate: new Date().toISOString().split("T")[0],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    if (!paymentData.paymentamount || !paymentData.paymenttype) {
      return;
    }

    try {
      setSubmitting(true);
      await createPayment({
        bookingid: selectedBooking.bookingid,
        paymentamount: parseFloat(paymentData.paymentamount),
        paymenttype: paymentData.paymenttype,
        paymentdate: paymentData.paymentdate,
      });

      setSelectedBooking(null);
      toast.success("Operation completed successfully");
      // Refresh data
      await fetchData();
    } catch (err) {
      console.error("Error recording payment:", err);
      toast.error("Failed to record payment", {
        description: "Please try again later",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Payment Management
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Record Payments</h1>
          <p className="text-gray-500">
            Manage and record customer payments for completed services.
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="font-bold">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="font-bold">
              Completed ({completedPayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingBookings.map((booking) => (
                  <PaymentCard
                    key={booking.bookingid}
                    item={booking}
                    onRecordPayment={handleRecordPayment}
                    isPayment={false}
                    onRefresh={fetchData}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2">
                    No pending payments
                  </h3>
                  <p className="text-gray-600">
                    No completed bookings are awaiting payment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedPayments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedPayments.map((payment) => (
                  <PaymentCard
                    key={payment.paymentid}
                    item={payment}
                    isPayment={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <DollarSign
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2">
                    No completed payments
                  </h3>
                  <p className="text-gray-600">
                    Recorded payments will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

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
    </div>
  );
};

export default PaymentManagementPage;
