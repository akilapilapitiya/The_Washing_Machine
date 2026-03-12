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
import { useSetPageHeader } from "@/contexts/PageHeaderContext";


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

  useSetPageHeader(
    "Billing",
    "Payment History",
    "Access your complete transaction history and receipts.",
  );

  if (loading) return <PageLoader message="Loading payments..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {payments.length > 0 ? (
        <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Services
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Method
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">
                    Record
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => {
                  const vehicleName = payment.vehbrand
                    ? `${payment.vehbrand} ${payment.vehmodel}`
                    : `Booking #${payment.bookingid}`;
                  const servicesList = payment.services
                    ? payment.services.join(", ")
                    : "General Service";

                  return (
                    <tr
                      key={payment.paymentid}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-gray-400" />
                          <span className="font-mono text-xs font-bold text-gray-600">
                            {payment.paymentid}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {formatDateShortSL(payment.paymentdate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 leading-tight">
                            {vehicleName}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 italic">
                            {payment.vehplate}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-600 font-medium line-clamp-1 max-w-[150px]" title={servicesList}>
                          {servicesList}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-700 capitalize">
                            {payment.paymenttype}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-gray-900">
                          Rs. {Number(payment.paymentamount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => printReceipt(payment)}
                          className="h-8 text-[11px] font-black uppercase text-gray-400 hover:text-red-600 hover:bg-red-50 p-2"
                        >
                          Invoice
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed py-24 bg-transparent border-gray-200">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <CreditCard size={48} className="text-gray-300" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold">No payments recorded</h3>
              <p className="text-gray-500 max-w-xs text-sm">
                Your transaction history is empty. Receipts will appear here
                after your next service.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    
  );
};

export default PaymentHistoryPage;
