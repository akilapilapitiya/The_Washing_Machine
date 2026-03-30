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
  ShieldAlert,
  ChevronRight,
  X,
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
      setPendingBookings(
        bookings.filter((b) => b.bookingstatus === "completed"),
      );
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
                activeTab === "pending"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Pending ({pendingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${
                activeTab === "completed"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Completed ({completedPayments.length})
            </button>
          </div>
        }
        stats={[
          {
            icon: DollarSign,
            label: "Pending",
            value: pendingBookings.length,
            iconClassName: "text-red-500",
          },
          {
            icon: CheckCircle,
            label: "Completed",
            value: completedPayments.length,
            iconClassName: "text-green-500",
          },
        ]}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          activeTab === "completed"
            ? "Search payments..."
            : "Search bookings..."
        }
        searchWidthClass="sm:w-72"
      />
    ),
    [activeTab, completedPayments.length, pendingBookings.length, searchQuery],
  );

  useSetPageHeader(
    "Payment Management",
    "Review Payments",
    "Manage and record customer payments for completed services.",
    null,
    toolbar,
  );

  if (loading) return <PageLoader message="Loading payment information..." />;

  const isPaymentView = activeTab === "completed";

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-mono font-bold text-gray-500 text-sm">
          #
          {String(isPaymentView ? row.paymentid : row.bookingid).padStart(
            4,
            "0",
          )}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer & Vehicle",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm">
            {row.cusname || "Unregistered"}
          </span>
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
            ? format(
                new Date(row[isPaymentView ? "paymentdate" : "bookingdate"]),
                "MMM d, yyyy",
              )
            : "N/A"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => {
        const extrasTotal = (row.extras || []).reduce(
          (sum, e) => sum + (Number(e.price) || 0),
          0,
        );
        const baseTotal = Number(row.totalprice || row.total_price || 0);
        const displayTotal = isPaymentView
          ? Number(row.paymentamount)
          : baseTotal + extrasTotal;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">
              Rs.{displayTotal.toFixed(2)}
            </span>
            {!isPaymentView && extrasTotal > 0 && (
              <span className="text-[10px] text-orange-600 font-medium">
                Incl. Rs.{extrasTotal.toFixed(2)} extras
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={isPaymentView ? "paid" : row.bookingstatus} />
      ),
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
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  };

  const emptyProps = isPaymentView
    ? {
        icon: DollarSign,
        title: "No completed payments",
        subtitle: "Recorded payments will appear here.",
      }
    : {
        icon: CheckCircle,
        title: "No pending payments",
        subtitle: "No completed bookings are awaiting payment.",
      };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <DataTable
        columns={columns}
        data={getActiveData()}
        keyField={isPaymentView ? "paymentid" : "bookingid"}
        emptyIcon={emptyProps.icon}
        emptyTitle={emptyProps.title}
        emptySubtitle={
          searchQuery ? "No records match your search." : emptyProps.subtitle
        }
      />

      {/* Payment Recording Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-in fade-in duration-200">
          <Card className="w-full h-full max-w-[95vw] max-h-[95vh] shadow-2xl border-0 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-1.5 bg-red-600 shrink-0" />
            <CardHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between bg-white shrink-0">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter text-gray-900">
                    Record Payment
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all focus:outline-none"
              >
                <X size={24} />
              </button>
            </CardHeader>
            
            {/* Content Split */}
            <CardContent className="p-0 flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50/30">
              
              {/* LEFT: Full Data Table (Flex 1, scrolls) */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50 border-r border-gray-200">
                <div className="mb-6">
                  <h4 className="text-xl font-black text-gray-900">Charges Ledger</h4>
                  <p className="text-sm text-gray-500">Review and adjust all billable items for this session.</p>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/80 text-[10px] uppercase tracking-widest text-gray-500 font-black border-b border-gray-200 uppercase">
                        <th className="px-8 py-5">Line Item</th>
                        <th className="px-8 py-5 text-right">Billed Price (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      
                      {/* Unified List: Services first, then Extras with a Divider */}
                      {(() => {
                        const services = (selectedBooking.services || []).map(s => ({ ...s, itemType: 'service' }));
                        const extras = (selectedBooking.extras || []).map(e => ({ ...e, itemType: 'extra' }));
                        const items = [...services, ...extras];
                        
                        return items.map((item, idx) => {
                          const isService = item.itemType === 'service';
                          const isFirstExtra = !isService && (idx === 0 || items[idx-1].itemType === 'service');
                          
                          const itemName = isService ? (item.servicename || item.serviceName) : item.item_name;
                          const itemPrice = isService ? (item.serviceprice || item.price) : item.price;
                          const itemId = isService ? (item.serviceid || item.serviceId || item.id) : item.id;
                          const isPending = !isService && (!item.price || Number(item.price) === 0);

                          return (
                            <React.Fragment key={`${item.itemType}-${itemId}-${idx}`}>
                              {isFirstExtra && (
                                <tr className="bg-gray-50/50">
                                  <td colSpan={2} className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-y border-gray-100 uppercase">
                                    Employee Specified Charges (Add-ons)
                                  </td>
                                </tr>
                              )}
                              <tr className="hover:bg-blue-50/20 transition-colors group">
                                <td className="px-8 py-5 text-sm font-bold text-gray-900">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isService ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                      {isService ? <CheckCircle size={14} /> : <Plus size={14} />}
                                    </div>
                                    <div className="flex flex-col">
                                      <span>{itemName}</span>
                                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                                        {isService ? "Initial Booking Service" : "In-session Extra Charge"}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <div className={`inline-flex items-center gap-1 bg-white border rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 transition-all ${isPending ? 'border-orange-300 focus-within:ring-orange-500' : 'border-gray-200 focus-within:ring-red-500'}`}>
                                    <span className="text-xs text-gray-400 font-bold">Rs.</span>
                                    <input
                                      type="number"
                                      defaultValue={itemPrice && Number(itemPrice) > 0 ? Number(itemPrice).toFixed(2) : ""}
                                      className={`w-28 text-right text-sm font-black bg-transparent outline-none p-0 border-0 focus:ring-0 ${isPending ? 'text-orange-900 placeholder:text-orange-300' : 'text-gray-900 placeholder:text-gray-300'}`}
                                      placeholder="0.00"
                                      onBlur={async (e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val) && val >= 0 && val !== Number(itemPrice) && itemId) {
                                          try {
                                            if (isService) {
                                              await chargesService.updateServicePrice(selectedBooking.bookingid, itemId, val);
                                              setSelectedBooking((prev) => {
                                                const newServices = prev.services.map((srv) => (srv.serviceid || srv.serviceId || srv.id) === itemId ? { ...srv, serviceprice: val, price: val } : srv);
                                                const sumServices = newServices.reduce((sum, item) => sum + (Number(item.serviceprice || item.price) || 0), 0);
                                                const sumExtras = (prev.extras || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
                                                const distanceCost = Number(prev.travel_cost || 0);
                                                const updatedTotalPrice = sumServices + distanceCost;
                                                setPaymentData((d) => ({ ...d, paymentamount: (updatedTotalPrice + sumExtras).toFixed(2) }));
                                                return { ...prev, services: newServices, totalprice: updatedTotalPrice, total_price: updatedTotalPrice };
                                              });
                                            } else {
                                              await chargesService.updateItemPrice(itemId, val);
                                              setSelectedBooking((prev) => {
                                                const newExtras = prev.extras.map((x) => x.id === itemId ? { ...x, price: val } : x);
                                                const newExtrasTotal = newExtras.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
                                                const base = Number(prev.totalprice || prev.total_price || 0);
                                                setPaymentData((d) => ({ ...d, paymentamount: (base + newExtrasTotal).toFixed(2) }));
                                                return { ...prev, extras: newExtras };
                                              });
                                            }
                                            toast.success(`Updated successfully.`);
                                            fetchData();
                                          } catch (err) {
                                            toast.error("Failed to update price");
                                          }
                                        }
                                      }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        });
                      })()}

                      {/* Travel Charge specifically */}
                      {Number(selectedBooking.travel_cost) > 0 && (
                        <tr className="bg-purple-50/10">
                          <td className="px-8 py-5 text-sm font-bold text-gray-900">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <DollarSign size={14} />
                              </div>
                              <div className="flex flex-col">
                                <span>Mobile Unit Surcharge</span>
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Location Based Overhead Fee</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right text-sm font-black text-gray-900 pr-12">
                            Rs. {Number(selectedBooking.travel_cost).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT: Validation & Pay (Sticky Form) */}
              <div className="w-full lg:w-[420px] shrink-0 bg-white p-6 lg:p-10 flex flex-col justify-between overflow-y-auto">
                <form onSubmit={handleSubmitPayment} className="space-y-8 flex flex-col h-full justify-between">
                  <div className="space-y-8">
                    <h5 className="text-xs font-black uppercase tracking-widest text-red-600 border-b-2 border-red-600 pb-2 inline-block">
                      Finalized Summary
                    </h5>
                    
                    <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-6 space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Grand Total</p>
                      <h2 className="text-4xl font-bold tracking-tight text-gray-900 flex items-baseline gap-1">
                        <span className="text-xl text-gray-400 font-medium">Rs.</span>
                        {(
                          Number(selectedBooking.totalprice || selectedBooking.total_price || 0) +
                          (selectedBooking.extras || []).reduce((sum, e) => sum + (Number(e.price) || 0), 0)
                        ).toFixed(0)}
                        <span className="text-2xl text-gray-400">
                          .{(
                            Number(selectedBooking.totalprice || selectedBooking.total_price || 0) +
                            (selectedBooking.extras || []).reduce((sum, e) => sum + (Number(e.price) || 0), 0)
                          ).toFixed(2).split('.')[1]}
                        </span>
                      </h2>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collected Amount *</Label>
                        <Input
                          name="paymentamount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={paymentData.paymentamount}
                          onChange={handleInputChange}
                          className="h-12 text-base font-semibold bg-white border-gray-200 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tender Method *</Label>
                        <select
                          name="paymenttype"
                          value={paymentData.paymenttype}
                          onChange={handleInputChange}
                          className="w-full h-12 px-3 text-sm font-semibold bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
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
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction Date *</Label>
                        <Input
                          name="paymentdate"
                          type="date"
                          value={paymentData.paymentdate}
                          onChange={handleInputChange}
                          className="h-12 text-sm font-semibold bg-white border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-14 rounded-xl font-bold text-xs uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200/50"
                    >
                      {submitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        "Complete Payment"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentManagementPage;
