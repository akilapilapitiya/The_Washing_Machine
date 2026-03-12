import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
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
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";

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

const PaymentTable = ({ items, onRecordPayment, isPayment, onRefresh }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Customer & Vehicle</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Date</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => {
              const bookingId = item.bookingid;
              const status = isPayment ? "paid" : item.bookingstatus;
              const extrasTotal = (item.extras || []).reduce((sum, e) => sum + (Number(e.price) || 0), 0);
              const baseTotal = Number(item.totalprice || item.total_price || 0);
              const displayTotal = isPayment ? Number(item.paymentamount) : baseTotal + extrasTotal;
              const date = isPayment ? item.paymentdate : item.bookingdate;

              return (
                <tr key={isPayment ? item.paymentid : item.bookingid} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-500 text-sm">
                      #{String(bookingId).padStart(4, "0")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm">{item.cusname || "Unregistered"}</span>
                      <span className="text-xs text-gray-500 font-medium">
                        {item.vehbrand} {item.vehmodel} • {item.vehplate}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {formatDate(date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">Rs.{displayTotal.toFixed(2)}</span>
                      {!isPayment && extrasTotal > 0 && (
                        <span className="text-[10px] text-orange-600 font-medium">Incl. Rs.{extrasTotal.toFixed(2)} extras</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPayment ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-black uppercase border-gray-200"
                          onClick={() => printReceipt(item)}
                        >
                          <Download size={14} className="mr-1" /> Receipt
                        </Button>
                      ) : (
                        <Button
                          onClick={() => onRecordPayment(item)}
                          className="h-8 text-[10px] font-black uppercase bg-red-600 hover:bg-red-700 text-white"
                        >
                          Record Payment
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
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
  const [searchParams] = useSearchParams();

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

  // Deep linking logic
  useEffect(() => {
    if (!loading && pendingBookings.length > 0) {
      const bookingId = searchParams.get("bookingId");
      if (bookingId) {
        const booking = pendingBookings.find(b => b.bookingid.toString() === bookingId);
        if (booking) {
          handleRecordPayment(booking);
        }
      }
    }
  }, [loading, pendingBookings, searchParams]);

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

  useSetPageHeader(
    "Payment Management",
    "Review Payments",
    "Manage and record customer payments for completed services.",
  );

  if (loading) return <PageLoader message="Loading payment information..." />;

  return (
          <div className="mx-auto w-full max-w-7xl space-y-8">
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
              <PaymentTable
                items={pendingBookings}
                onRecordPayment={handleRecordPayment}
                isPayment={false}
                onRefresh={fetchData}
              />
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
              <PaymentTable
                items={completedPayments}
                isPayment={true}
              />
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
    
  );
};

export default PaymentManagementPage;
