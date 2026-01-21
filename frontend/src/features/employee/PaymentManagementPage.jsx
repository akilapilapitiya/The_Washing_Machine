import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Car,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";

// Mock payment data
const mockPendingPayments = [
  {
    id: "1",
    bookingId: "BK-2025-001",
    customer: { name: "John Doe", phone: "+94 77 123 4567" },
    vehicle: { brand: "Toyota", model: "Corolla", plate: "ABC-123" },
    services: ["Exterior Wash", "Interior Detailing"],
    date: "2025-12-31",
    totalAmount: 80,
    amountPaid: 0,
    paymentMethod: null,
    status: "pending",
  },
  {
    id: "2",
    bookingId: "BK-2025-002",
    customer: { name: "Sarah Smith", phone: "+94 77 987 6543" },
    vehicle: { brand: "Honda", model: "Civic", plate: "XYZ-789" },
    services: ["Full Service Detail"],
    date: "2025-12-30",
    totalAmount: 120,
    amountPaid: 50,
    paymentMethod: "Partial - Cash",
    status: "partial",
  },
];

const mockCompletedPayments = [
  {
    id: "3",
    bookingId: "BK-2025-003",
    customer: { name: "Michael Brown", phone: "+94 77 555 1234" },
    vehicle: { brand: "Ford", model: "F-150", plate: "TRK-555" },
    services: ["Oil Change", "Tire & Wheel Care"],
    date: "2025-12-28",
    totalAmount: 75,
    amountPaid: 75,
    paymentMethod: "Credit Card",
    status: "paid",
    completedDate: "2025-12-28",
  },
  {
    id: "4",
    bookingId: "BK-2025-004",
    customer: { name: "Emma Wilson", phone: "+94 77 321 9876" },
    vehicle: { brand: "Nissan", model: "Altima", plate: "DEF-456" },
    services: ["Engine Bay Clean", "Exterior Wash"],
    date: "2025-12-25",
    totalAmount: 90,
    amountPaid: 90,
    paymentMethod: "Cash",
    status: "paid",
    completedDate: "2025-12-25",
  },
];

const paymentMethods = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Mobile Payment",
  "Bank Transfer",
  "Cheque",
];

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    partial: "bg-orange-50 text-orange-700 border-orange-100",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  const labels = {
    pending: "Pending",
    partial: "Partial Payment",
    paid: "Paid",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

const PaymentCard = ({ payment, onRecordPayment }) => {
  const remainingAmount = payment.totalAmount - payment.amountPaid;
  const isPaid = payment.status === "paid";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{payment.bookingId}</CardTitle>
            <p className="text-sm text-gray-600">
              {payment.vehicle.brand} {payment.vehicle.model} (
              {payment.vehicle.plate})
            </p>
          </div>
          <StatusBadge status={payment.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Customer
            </p>
            <p className="text-sm font-medium">{payment.customer.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Date
            </p>
            <p className="text-sm font-medium">
              {new Date(payment.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Total Amount</span>
            <span className="text-lg font-bold text-gray-900">
              ${payment.totalAmount}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="text-sm text-gray-700">Amount Paid</span>
            <span
              className={`text-sm font-semibold ${
                payment.amountPaid > 0 ? "text-green-600" : "text-gray-400"
              }`}
            >
              ${payment.amountPaid}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="text-sm text-gray-700">Outstanding</span>
            <span
              className={`text-lg font-bold ${
                remainingAmount > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              ${remainingAmount}
            </span>
          </div>
        </div>

        {payment.paymentMethod && (
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
              Payment Method
            </p>
            <p className="text-sm font-medium">{payment.paymentMethod}</p>
          </div>
        )}

        {!isPaid && (
          <Button
            onClick={() => onRecordPayment(payment)}
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
  const [payments, setPayments] = useState(mockPendingPayments);
  const [completedPayments, setCompletedPayments] = useState(
    mockCompletedPayments,
  );
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amountPaid: "",
    paymentMethod: "",
    notes: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRecordPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentData({
      amountPaid: "",
      paymentMethod: "",
      notes: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();

    if (!paymentData.amountPaid || !paymentData.paymentMethod) {
      return;
    }

    const amountToAdd = parseFloat(paymentData.amountPaid);
    const newAmountPaid = selectedPayment.amountPaid + amountToAdd;
    const totalAmount = selectedPayment.totalAmount;
    const newStatus = newAmountPaid >= totalAmount ? "paid" : "partial";

    const updatedPayment = {
      ...selectedPayment,
      amountPaid: newAmountPaid,
      paymentMethod: paymentData.paymentMethod,
      status: newStatus,
    };

    // Update or move to completed
    if (newStatus === "paid") {
      setPayments(payments.filter((p) => p.id !== selectedPayment.id));
      setCompletedPayments([updatedPayment, ...completedPayments]);
    } else {
      setPayments(
        payments.map((p) => (p.id === selectedPayment.id ? updatedPayment : p)),
      );
    }

    setSelectedPayment(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

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

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">
              Payment recorded successfully!
            </p>
          </div>
        )}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedPayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {payments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {payments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onRecordPayment={handleRecordPayment}
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
                    All payments have been recorded.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedPayments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedPayments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
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
                    Paid invoices will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Payment Recording Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <DollarSign size={24} className="text-red-600" />
                  Record Payment - {selectedPayment.bookingId}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  {/* Payment Summary */}
                  <div className="bg-red-50 rounded-lg p-4 space-y-2 border border-red-100">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm font-medium">
                        Total Amount Due
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${selectedPayment.totalAmount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm font-medium">
                        Already Paid
                      </span>
                      <span className="text-lg font-semibold text-emerald-600">
                        ${selectedPayment.amountPaid}
                      </span>
                    </div>
                    <div className="border-t border-red-200 pt-2 flex justify-between">
                      <span className="text-gray-800 font-bold">
                        Remaining Balance
                      </span>
                      <span className="text-xl font-black text-red-600">
                        $
                        {selectedPayment.totalAmount -
                          selectedPayment.amountPaid}
                      </span>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">Amount to Record ($) *</Label>
                    <Input
                      id="amountPaid"
                      name="amountPaid"
                      type="number"
                      step="0.01"
                      min="0"
                      max={
                        selectedPayment.totalAmount - selectedPayment.amountPaid
                      }
                      value={paymentData.amountPaid}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Maximum: $
                      {selectedPayment.totalAmount - selectedPayment.amountPaid}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={paymentData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                      required
                    >
                      <option value="">-- Select payment method --</option>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={paymentData.notes}
                      onChange={handleInputChange}
                      placeholder="Add any notes about this payment..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none bg-white"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedPayment(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      <CheckCircle size={18} />
                      Record Payment
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
