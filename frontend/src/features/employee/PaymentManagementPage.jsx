import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  CheckCircle,
  Plus,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { getBookings } from "@/services/booking.service";
import { getAllPayments, createPayment } from "@/services/payment.service";
import { printReceipt } from "@/utils/receipt";

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

const PaymentCard = ({ item, onRecordPayment, isPayment }) => {
  // item is either a booking (pending payment) or a payment object (completed)
  const bookingId = isPayment ? item.bookingid : item.bookingid;
  const status = isPayment ? "paid" : item.bookingstatus;
  const brand = item.vehbrand || "Vehicle";
  const model = item.vehmodel || "";
  const plate = item.vehplate || "";
  const customerName = item.cusname || "Customer";
  const totalAmount = isPayment
    ? item.paymentamount
    : item.totalprice || item.total_price || 0;
  const date = isPayment ? item.paymentdate : item.bookingdate;
  const services = item.services || [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              BK-{bookingId.toString().padStart(4, "0")}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {brand} {model} ({plate})
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Customer
            </p>
            <p className="text-sm font-medium">{customerName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Date
            </p>
            <p className="text-sm font-medium">
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Services
          </p>
          <div className="flex flex-wrap gap-1">
            {services.map((s, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-[10px] px-2 py-0.5 rounded text-gray-700 italic"
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

        <div className="bg-gray-50 rounded-lg p-3 mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">
              {isPayment ? "Amount Paid" : "Amount Due"}
            </span>
            <span className="text-lg font-bold text-gray-900">
              Rs.{totalAmount}
            </span>
          </div>
        </div>

        {isPayment && item.paymenttype && (
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
              Payment Method
            </p>
            <p className="text-sm font-medium capitalize">{item.paymenttype}</p>
          </div>
        )}

        {isPayment && (
          <div className="pt-2 mt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-dashed"
              onClick={() => printReceipt(item)}
            >
              <Download size={14} /> Print Receipt
            </Button>
          </div>
        )}

        {!isPayment && (
          <Button
            onClick={() => onRecordPayment(item)}
            className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold"
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
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentamount: "",
    paymenttype: "",
    paymentdate: new Date().toISOString().split("T")[0],
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
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
      setError(null);
    } catch (err) {
      console.error("Error fetching payment data:", err);
      setError(
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
    setPaymentData({
      paymentamount: booking.totalprice || booking.total_price || "",
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error("Error recording payment:", err);
      alert("Failed to record payment. Please try again.");
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">
              Payment recorded successfully and booking marked as paid!
            </p>
          </div>
        )}

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
                        {selectedBooking.totalprice ||
                          selectedBooking.total_price ||
                          0}
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
                      disabled={submitting}
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
