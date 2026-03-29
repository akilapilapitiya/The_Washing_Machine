import React from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  Umbrella,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateSL } from "@/lib/dateFormat";

const QuickActionTile = ({ title, to, icon: Icon, colorClass }) => (
  <Link to={to} className="block">
    <Card className="h-full border-gray-100 hover:border-red-200 hover:shadow-md transition-all group overflow-hidden bg-white">
      <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-3">
        <div
          className={`p-4 rounded-xl ${colorClass} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="w-8 h-8 sm:w-6 sm:h-6" />
        </div>
        <p className="font-bold text-gray-900 text-sm group-hover:text-red-700 transition-colors">
          {title}
        </p>
      </CardContent>
    </Card>
  </Link>
);

const EmployeeDashboard = ({ data, loading }) => {
  const assignedJobs = data.bookings.filter(
    (b) => b.bookingstatus === "confirmed" || b.bookingstatus === "inProgress",
  );

  const completedJobs = data.bookings.filter(
    (b) => b.bookingstatus === "completed",
  ).length;

  const totalAssignedToday = assignedJobs.length + completedJobs;
  const progressPercent =
    totalAssignedToday > 0
      ? Math.round((completedJobs / totalAssignedToday) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionTile
          title="My Schedule"
          to="/dashboard/employee/assigned"
          icon={Calendar}
          colorClass="bg-red-50 text-red-600"
        />
        <QuickActionTile
          title="Request Leave"
          to="/dashboard/employee/leaves"
          icon={Umbrella}
          colorClass="bg-red-50 text-red-600"
        />
        <QuickActionTile
          title="Log Incident"
          to="/dashboard/employee/incidents"
          icon={Wrench}
          colorClass="bg-red-50 text-red-600"
        />
        <QuickActionTile
          title="My Profile"
          to="/dashboard/profile"
          icon={CheckCircle2}
          colorClass="bg-red-50 text-red-600"
        />
      </div>

      {/* Today's Queue */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-red-600" />
            Today's Queue
          </h2>
          <Link to="/dashboard/employee/assigned">
            <Button
              variant="ghost"
              className="text-red-700 hover:text-red-800 hover:bg-red-50 font-semibold"
            >
              View Full Queue
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-white border border-gray-100 animate-pulse rounded-2xl shadow-sm"
              ></div>
            ))}
          </div>
        ) : assignedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedJobs.slice(0, 6).map((job) => (
              <Card
                key={job.bookingid}
                className="border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all group overflow-hidden bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 mb-2">
                        {job.bookingstatus}
                      </span>
                      <h3
                        className="font-bold text-gray-900 text-lg leading-tight truncate pr-4"
                        title={job.servicename || "Service Job"}
                      >
                        {job.servicename || "Service Job"}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-gray-400 shrink-0">
                      #{job.bookingid}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDateSL(job.bookingdate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {job.bookingstarttime}
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-red-50 text-red-700 hover:bg-red-600 hover:text-white font-bold transition-colors"
                  >
                    <Link to={`/dashboard/employee/assigned`}>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Job
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-white border border-gray-100 rounded-full shadow-sm flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Queue is Empty
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                You have no active or pending jobs assigned to you at the
                moment. Enjoy your break!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
