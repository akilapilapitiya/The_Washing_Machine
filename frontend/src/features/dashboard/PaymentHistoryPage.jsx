import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { formatDateShortSL } from "@/lib/dateFormat";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";

const PaymentHistoryCard = ({ payment }) => {
  const formatDate = (dateString) => {
    return formatDateShortSL(dateString);
  };

  const vehicleName = payment.vehbrand
    ? `${payment.vehbrand} ${payment.vehmodel}`
    : `Booking ID: ${payment.bookingid}`;

  const servicesList = payment.services
    ? payment.services.join(", ")
    : "General Service";

  return (
    <Card className="hover:shadow-md transition-all border-gray-200">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              {vehicleName}
            </CardTitle>
            <p className="text-sm text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">
              {payment.vehplate}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle size={10} />
            Paid
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500">Method</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <CreditCard size={14} className="text-gray-400" />
              <span className="capitalize">{payment.paymenttype}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500">Reference</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Hash size={14} className="text-gray-400" />
              <span>{payment.paymentid}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-red-600" />
            <span className="text-gray-600 font-medium">
              {formatDate(payment.paymentdate)}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <FileText size={14} className="text-red-600 mt-0.5" />
            <span className="text-gray-600 font-medium line-clamp-1">
              {servicesList}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Amount Paid
            </span>
            <span className="text-lg font-bold text-gray-900">
              Rs. {Number(payment.paymentamount).toLocaleString()}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => printReceipt(payment)}
            className="w-full h-9 text-xs font-medium border-gray-200 hover:bg-gray-50 hover:text-gray-900"
          >
            <Download size={12} className="mr-2" />
            Download Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getMyPayments();
        setPayments(data);
      } catch (err) {
        toast.error("Could not load payment history. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <PageLoader message="Loading payments..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-12 space-y-10 max-w-7xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Payment History
          </h1>
          <p className="text-gray-500">
            Access your complete transaction history and receipts.
          </p>
        </div>

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
