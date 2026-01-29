import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldAlert,
  Search,
  FileText,
  User,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import * as bookingService from "@/services/booking.service";
import * as incidentService from "@/services/incident.service";
import { toast } from "sonner";

const EmployeeIncidentPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Reporting State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Fetch bookings logic - strictly speaking we might want a specific endpoint for "my jobs" or similar
      // Reusing getBookings (which gets all bookings for employee dashboard context)
      // Ideally we filter for relevant ones (active or recent)
      const data = await bookingService.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.bookingstatus !== "cancelled" &&
      (b.cusname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vehplate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingid.toString().includes(searchQuery)),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !description) return;

    try {
      setSubmitting(true);
      await incidentService.createIncident({
        customerId: selectedBooking.cusid,
        bookingId: selectedBooking.bookingid,
        description: description,
        severity: severity,
      });
      setSuccess("Report submitted successfully.");
      setSelectedBooking(null);
      setDescription("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to report incident", {
        description: "Please try again later",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-red-700">
            <ShieldAlert /> Report Incident
          </h1>
          <p className="text-gray-600">
            Select a booking to report a safety issue or customer harassment.
          </p>
        </div>

        {success && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Selector */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Select Related Booking</CardTitle>
              <CardDescription>Search by name, plate, or ID</CardDescription>
              <div className="relative mt-2">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <Input
                  placeholder="Search active jobs..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto space-y-3">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div
                    key={booking.bookingid}
                    onClick={() => setSelectedBooking(booking)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedBooking?.bookingid === booking.bookingid
                        ? "bg-red-50 border-red-500 ring-1 ring-red-500"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          <span className="text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            #{booking.bookingid}
                          </span>
                          {booking.cusname}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.vehbrand} {booking.vehmodel} (
                          {booking.vehplate})
                        </p>
                      </div>
                      {/* Badge fallback */}
                      <span className="text-xs font-bold uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {booking.bookingstatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Report Form */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBooking ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
                    <p>
                      <strong>Ref Booking:</strong> #{selectedBooking.bookingid}
                    </p>
                    <p>
                      <strong>Customer:</strong> {selectedBooking.cusname}
                    </p>
                    <p>
                      <strong>Vehicle:</strong> {selectedBooking.vehplate}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="low">Low - Minor Concern</option>
                      <option value="medium">Medium - Harassment/Issue</option>
                      <option value="high">High - Aggressive Behavior</option>
                      <option value="critical">Critical - Emergency</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea
                      className="w-full min-h-[150px] p-3 border rounded-md"
                      placeholder="Describe exactly what happened..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-3">
                  <AlertCircle size={48} className="text-gray-300" />
                  <p>Select a booking from the list to start a report.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIncidentPage;
