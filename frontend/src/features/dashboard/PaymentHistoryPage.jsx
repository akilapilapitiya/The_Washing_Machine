import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Hash, ChevronRight, CreditCard } from "lucide-react";
import { getMyPayments } from "@/services/payment.service";
import { printReceipt } from "@/utils/receipt";
import { formatDateShortSL } from "@/lib/dateFormat";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getMyPayments();
        setPayments(data);
      } catch {
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

  const columns = [
    {
      key: "paymentid",
      label: "Reference",
      render: (row) => (
        <div className="flex items-center gap-1.5 opacity-60">
          <Hash size={12} />
          <span className="font-mono text-xs font-bold text-gray-600">
            {String(row.paymentid).padStart(4, "0")}
          </span>
        </div>
      ),
    },
    {
      key: "paymentdate",
      label: "Date",
      render: (row) => (
        <span className="text-sm font-bold text-gray-700">
          {formatDateShortSL(row.paymentdate)}
        </span>
      ),
    },
    {
      key: "vehicle",
      label: "Vehicle",
      render: (row) => {
        const vehicleName = row.vehbrand
          ? `${row.vehbrand} ${row.vehmodel}`
          : `Booking #${row.bookingid}`;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">
              {vehicleName}
            </span>
            <span className="text-[10px] font-mono text-gray-500 italic">
              {row.vehplate}
            </span>
          </div>
        );
      },
    },
    {
      key: "services",
      label: "Services",
      render: (row) => {
        const services = Array.isArray(row.services) ? row.services : [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {services.length > 0 ? (
              services.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-600 border border-gray-200 uppercase"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-[9px] font-bold text-gray-400 uppercase">
                General Service
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "paymenttype",
      label: "Method",
      render: (row) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-100">
          <CreditCard size={10} />
          {row.paymenttype}
        </div>
      ),
    },
    {
      key: "paymentamount",
      label: "Amount",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <span className="text-sm font-black text-gray-900">
          Rs. {Number(row.paymentamount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => printReceipt(row)}
          className="h-8 text-[11px] font-black uppercase text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 gap-1"
        >
          Invoice
          <ChevronRight size={14} />
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <DataTable
        columns={columns}
        data={payments}
        keyField="paymentid"
        emptyIcon={Wallet}
        emptyTitle="No payments recorded"
        emptySubtitle="Your transaction history is empty. Receipts will appear here after your next service."
      />
    </div>
  );
};

export default PaymentHistoryPage;
