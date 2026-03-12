import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  User,
  Mail,
  Phone,
  Calendar,
  X,
  CheckCircle,
  Search,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Car,
  ChevronRight,
  UserX,
  UserCheck,
} from "lucide-react";
import { getCustomers, updateCustomer } from "@/services/customer.service";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { IMAGE_BASE_URL } from "@/configs/env";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";

const ManageCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const { confirm, Dialog } = useConfirmDialog();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer) => {
    const isBlocking = customer.is_active;
    const confirmed = await confirm({
      variant: isBlocking ? "destructive" : "info",
      title: isBlocking ? "Restrict Access?" : "Restore Access?",
      description: isBlocking
        ? `Are you sure you want to block ${customer.first_name} ${customer.last_name}? They will lose all access to the platform immediately.`
        : `Allow ${customer.first_name} ${customer.last_name} to access the platform again?`,
      confirmText: isBlocking ? "Restrict" : "Restore",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await updateCustomer(customer.cusid, { isActive: !customer.is_active });
      toast.success(
        isBlocking
          ? "Customer account restricted"
          : "Customer account restored",
      );
      fetchCustomers();
      if (selectedCustomer?.cusid === customer.cusid) {
        setSelectedCustomer({ ...customer, is_active: !customer.is_active });
      }
    } catch (err) {
      console.error("Error updating customer status:", err);
      toast.error("Failed to update status.");
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.first_name} ${customer.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      customer.cusemail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.custel.includes(searchQuery),
  );

  const toolbar = useMemo(
    () => (
      <div className="flex flex-col sm:flex-row w-full gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Users size={14} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
            <span className="text-sm font-black text-gray-900">{customers.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
            <UserCheck size={14} className="text-green-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active</span>
            <span className="text-sm font-black text-gray-900">{customers.filter((c) => c.is_active).length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
            <UserX size={14} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Restricted</span>
            <span className="text-sm font-black text-gray-900">{customers.filter((c) => !c.is_active).length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Car size={14} className="text-purple-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bookings</span>
            <span className="text-sm font-black text-gray-900">
              {customers.reduce((acc, curr) => acc + (curr.totalbookings || 0), 0)}
            </span>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm rounded-lg bg-white border-gray-200"
          />
        </div>
      </div>
    ),
    [customers, searchQuery]
  );

  useSetPageHeader(
    "Admin",
    "Customer Directory",
    "Manage accounts and platform access for your registered members.",
    null,
    toolbar
  );

  const columns = [
    {
      key: "customer",
      label: "Customer Identity",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.profile_picture_url ? (
            <img
              src={`${IMAGE_BASE_URL}${row.profile_picture_url}`}
              alt={row.first_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
              {row.first_name?.[0]}
              {row.last_name?.[0]}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900">
              {row.first_name} {row.last_name}
            </p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              ID: #{row.cusid}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact Information",
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Mail size={12} className="text-gray-400" />
            <span>{row.cusemail}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Phone size={12} className="text-gray-400" />
            <span>{row.custel}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.is_active
            ? "bg-green-50 text-green-700 border border-green-100"
            : "bg-red-50 text-red-700 border border-red-100"
            }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${row.is_active ? "bg-green-600" : "bg-red-600"}`} />
          {row.is_active ? "Active" : "Restricted"}
        </div>
      ),
    },
    {
      key: "joined",
      label: "Joined Date",
      render: (row) => (
        <span className="text-xs font-bold text-gray-500">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => {
              setSelectedCustomer(row);
              setExpandedId(row.cusid);
            }}
            variant="ghost"
            className="h-8 px-3 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 hover:text-red-700 bg-red-50/30 rounded-lg"
          >
            Details
          </Button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-2 rounded-lg transition-all ${row.is_active
              ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
              : "text-green-600 hover:bg-green-50"
              }`}
            title={row.is_active ? "Restrict Access" : "Restore Access"}
          >
            {row.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Customers Table */}
        <div className="space-y-4">
          {loading ? (
            <PageLoader message="Loading customer base..." />
          ) : (
            <DataTable
              columns={columns}
              data={filteredCustomers}
              keyField="cusid"
              emptyIcon={Users}
              emptyTitle="No members found"
              emptySubtitle={searchQuery ? "No members match your search." : "Your member directory is empty."}
            />
          )}
        </div>
      </div >

      {/* Customer Detail Modal */}
      {
        expandedId && selectedCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-in fade-in duration-200 overflow-y-auto">
            <Card className="w-full max-w-4xl shadow-2xl border-0 overflow-hidden my-auto">
              <div
                className={`h-1.5 ${selectedCustomer.is_active ? "bg-red-600" : "bg-gray-400"}`}
              />
              <CardHeader className="p-8 pb-4 border-b border-gray-50 flex flex-row items-center justify-between bg-white text-gray-900">
                <div className="flex gap-6 items-center">
                  <div className="relative shrink-0">
                    {selectedCustomer.profile_picture_url ? (
                      <img
                        src={`${IMAGE_BASE_URL}${selectedCustomer.profile_picture_url}`}
                        alt={selectedCustomer.first_name}
                        className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
                        {selectedCustomer.first_name?.[0]}
                        {selectedCustomer.last_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold tracking-tight">
                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                      </h3>
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedCustomer.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                          }`}
                      >
                        {selectedCustomer.is_active
                          ? "Account Active"
                          : "Blocked"}
                      </div>
                    </div>
                    <p className="text-gray-500 font-semibold flex items-center gap-2 text-sm uppercase tracking-wider">
                      {selectedCustomer.title}
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      ID #{selectedCustomer.cusid}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setExpandedId(null);
                    setSelectedCustomer(null);
                  }}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={24} />
                </button>
              </CardHeader>

              <CardContent className="p-8 bg-white grid md:grid-cols-2 gap-10">
                {/* Profile Info */}
                <div className="space-y-6">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-4">
                    Member Details
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Email Address
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedCustomer.cusemail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Mobile Phone
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedCustomer.custel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          NIC / Identity
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedCustomer.nic || "Not Linked"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats & Insights */}
                <div className="space-y-6 text-gray-600">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-4">
                    Platform Interaction
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Membership Since
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(
                            selectedCustomer.created_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                        <Car size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Total Bookings
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedCustomer.totalbookings || 0} Professional
                          Washes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Primary Location
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedCustomer.latitude && selectedCustomer.longitude
                            ? "Geo-coordinates Linked"
                            : "No Location Saved"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${selectedCustomer.is_active ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                  />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1 bg-white rounded border">
                    System Status:{" "}
                    {selectedCustomer.is_active
                      ? "Online & Authorized"
                      : "Offline & Restricted"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleToggleStatus(selectedCustomer)}
                    variant={selectedCustomer.is_active ? "outline" : "default"}
                    className={`h-9 px-6 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${selectedCustomer.is_active
                      ? "text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700"
                      : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                  >
                    {selectedCustomer.is_active
                      ? "Block Account"
                      : "Unblock Account"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )
      }
      <Dialog />
    </>
  );
};

export default ManageCustomersPage;
