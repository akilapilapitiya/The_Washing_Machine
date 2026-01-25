import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  X,
  CheckCircle,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getCustomers } from "@/services/customer.service";

const ManageCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    // In this app, customers usually sign up themselves.
    // This UI is kept for visual completeness but currently just simulates adding to the list locally if mocked,
    // or you'd call a POST /customer endpoint if one existed.
    alert(
      "New customer registration is handled via the Signup page or public API.",
    );
    setShowAddForm(false);
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.cusname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.cusemail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.custel.includes(searchQuery),
  );

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
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
              Customer Management
            </p>
            <h1 className="text-3xl font-bold">Manage Customers</h1>
            <p className="text-gray-600">
              View registered customers and their booking activity.
            </p>
          </div>
          {/* Note: In a real scenario, admins might have a specialized registration tool */}
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
              Action completed successfully!
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {customers.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Customers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {customers.length > 0
                    ? (
                        customers.reduce(
                          (sum, c) => sum + (c.totalbookings || 0),
                          0,
                        ) / customers.length
                      ).toFixed(1)
                    : 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Avg. Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {
                    customers.filter((c) => {
                      const joinDate = new Date(c.created_at);
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      return joinDate >= monthAgo;
                    }).length
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">New This Month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Grid */}
        {filteredCustomers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card
                key={customer.cusid}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                        <User size={24} className="text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {customer.cusname}
                        </CardTitle>
                        <p className="text-xs text-gray-500 italic">
                          #{customer.cusid}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-500" />
                      <span className="text-gray-700 truncate">
                        {customer.cusemail}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-500" />
                      <span className="text-gray-700">{customer.custel}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Bookings:</span>
                      <span className="font-semibold text-red-600">
                        {customer.totalbookings || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>
                        Joined{" "}
                        {new Date(customer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No customers found" : "No customers registered"}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search criteria."
                  : "Registered customers will appear here."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Customer Modal - Simplified based on feedback */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} className="text-red-600" />
                  Register Customer
                </CardTitle>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Please use the public{" "}
                <strong className="text-red-600">Signup</strong> page or the API
                to register new customers with full security.
              </p>
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageCustomersPage;
