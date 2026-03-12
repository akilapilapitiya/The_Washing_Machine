import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, Loader2, CheckCircle } from "lucide-react";
import * as schedulerService from "@/services/scheduler.service";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LeaveCard = ({ leave }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const duration = calculateDuration(leave.leavestartdate, leave.leaveenddate);

  return (
    <Card className="transition hover:shadow-md hover:border-red-200 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg font-bold">
                {formatDate(leave.leavestartdate)} -{" "}
                {formatDate(leave.leaveenddate)}
              </CardTitle>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-300">
                <CheckCircle size={12} className="mr-1" />
                Approved
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {duration} {duration === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <FileText size={14} className="text-gray-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Reason</p>
              <p className="text-gray-900">{leave.leavereason}</p>
            </div>
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            <span>Requested on {formatDate(leave.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MyLeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      toast.dismiss();
      const data = await schedulerService.getMyLeaves();
      setLeaves(data || []);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      toast.error("Failed to load your leave records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Separate upcoming and past leaves
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingLeaves = leaves.filter(
    (leave) => new Date(leave.leaveenddate) >= today,
  );
  const pastLeaves = leaves.filter(
    (leave) => new Date(leave.leaveenddate) < today,
  );

  useSetPageHeader(
    "Employee Portal",
    "My Leaves",
    "View your approved leave requests and time off.",
  );

  if (loading) return <PageLoader message="Loading leave records..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="bg-gray-100/50 border border-gray-100 p-1">
            <TabsTrigger 
              value="upcoming" 
              className="px-6 py-2 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="px-6 py-2 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all"
            >
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {upcomingLeaves.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingLeaves.map((leave) => (
                  <LeaveCard key={leave.leaveid} leave={leave} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 py-24 bg-transparent border-gray-200">
                <CardContent className="text-center space-y-4">
                  <div className="p-4 bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                    <Calendar size={40} className="text-gray-200" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">No Upcoming Leaves</h3>
                    <p className="text-gray-500 text-sm">
                      You don't have any approved leaves scheduled.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            {pastLeaves.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastLeaves.map((leave) => (
                  <LeaveCard key={leave.leaveid} leave={leave} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 py-24 bg-transparent border-gray-200">
                <CardContent className="text-center space-y-4">
                  <div className="p-4 bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                    <FileText size={40} className="text-gray-200" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">No Leave History</h3>
                    <p className="text-gray-500 text-sm">
                      Your past leave records will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyLeavesPage;
