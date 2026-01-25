import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  DollarSign,
  Loader2,
  Hash,
  Download,
} from "lucide-react";
import { getMyPayments } from "@/services/payment.service";
import { printReceipt } from "@/utils/receipt";
import { COLORS } from "@/lib/colors";

const PaymentHistoryCard = ({ payment }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const vehicleName = payment.vehbrand
    ? `${payment.vehbrand} ${payment.vehmodel}`
    : `Booking ID: ${payment.bookingid}`;

  const servicesList = payment.services
    ? payment.services.join(", ")
    : "General Service";

  return (
    <Card className="hover:shadow-md transition-all border-gray-100">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{vehicleName}</CardTitle>
            <p className={`text-sm ${COLORS.text.secondary}`}>
              {payment.vehplate}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
            <CheckCircle size={12} />
            Paid
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-gray-50">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Method
            </span>
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard size={14} className={COLORS.text.brand} />
              <span className="capitalize">{payment.paymenttype}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Reference
            </span>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Hash size={14} className={COLORS.text.brand} />
              <span>#{payment.paymentid}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <Calendar size={16} className={`${COLORS.icon.brand} mt-0.5`} />
            <span className="text-gray-700 font-medium">
              {formatDate(payment.paymentdate)}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <FileText size={16} className={`${COLORS.icon.brand} mt-0.5`} />
            <span className="text-gray-700 line-clamp-1">{servicesList}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 bg-gray-50/50 -mx-6 px-6 -mb-6 py-4 rounded-b-lg custom-print-hide">
          <span className="text-sm font-semibold text-gray-500">
            Amount Released
          </span>
          <span className={`text-lg font-bold ${COLORS.text.brand}`}>
            Rs. {Number(payment.paymentamount).toLocaleString()}
          </span>
        </div>

        <div className="pt-4 mt-2 border-t border-dashed border-gray-100">
          <button
            onClick={() => printReceipt(payment)}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={14} />
            Download Receipt
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getMyPayments();
        setPayments(data);
      } catch (err) {
        setError("Could not load payment history. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className={`h-12 w-12 animate-spin ${COLORS.icon.brand}`} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-12 space-y-10 max-w-7xl">
        <div className="space-y-2">
          <p
            className={`text-sm uppercase tracking-wide ${COLORS.text.brand} font-semibold`}
          >
            Financial Records
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-gray-500 max-w-2xl">
            Access your complete transaction history, billing statements, and
            proof of payments here.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <PaymentHistoryCard key={payment.paymentid} payment={payment} />
            ))
          ) : (
            <Card className="col-span-full border-dashed py-24 bg-transparent border-gray-200">
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <CreditCard size={48} className="text-gray-300" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold">No payments recorded</h3>
                  <p className="text-gray-500 max-w-xs">
                    Your transaction history is empty. Receipts will appear here
                    after your next service.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
