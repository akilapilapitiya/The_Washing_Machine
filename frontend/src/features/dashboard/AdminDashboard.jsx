import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Briefcase,
  ShieldCheck,
  Settings,
  ListChecks,
  Umbrella,
  BarChart3,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminActionItem = ({ title, description, to, icon: Icon }) => (
  <Link to={to} className="group block">
    <div className="flex items-center p-4 rounded-xl border border-gray-100 bg-white hover:border-red-200 hover:shadow-md transition-all">
      <div className="p-3 bg-red-50 rounded-lg text-red-600 group-hover:scale-110 transition-transform duration-300">
         <Icon className="w-5 h-5" />
      </div>
      <div className="ml-4 flex-1">
         <h4 className="font-bold text-gray-900 leading-tight group-hover:text-red-700 transition-colors">{title}</h4>
         <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 transition-colors transform group-hover:translate-x-1" />
    </div>
  </Link>
);

const AdminDashboard = ({ data, loading }) => {
  const totalBookings = data.bookings.length;
  const completedJobs = data.bookings.filter((b) => b.bookingstatus === "completed").length;
  
  const totalAmount = data.payments.reduce(
    (sum, p) => sum + (parseFloat(p.paymentamount) || 0),
    0
  );

  const pendingBookings = data.bookings.filter((b) => b.bookingstatus === "pending").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* High-Level Business Snapshot */}
      <div>
         <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Business Performance</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-200 shadow-sm relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-green-50 to-transparent pointer-events-none"></div>
               <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
                     <div className="p-2 bg-green-100 rounded text-green-700"><CreditCard className="w-4 h-4" /></div>
                  </div>
                  {loading ? (
                     <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mt-2"></div>
                  ) : (
                     <h3 className="text-2xl font-black text-gray-900 mt-2">Rs. {totalAmount.toLocaleString()}</h3>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mt-2 flex items-center gap-1">
                     <TrendingUpIcon className="w-3 h-3" /> System Lifetime
                  </p>
               </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
               <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-semibold text-gray-500">Completed Jobs</p>
                     <div className="p-2 bg-blue-100 rounded text-blue-700"><CheckCircle2 className="w-4 h-4" /></div>
                  </div>
                  {loading ? (
                     <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-2"></div>
                  ) : (
                     <h3 className="text-2xl font-black text-gray-900 mt-2">{completedJobs}</h3>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-2 flex items-center gap-1">
                     Success Rate
                  </p>
               </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-red-50 to-transparent pointer-events-none"></div>
               <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-semibold text-gray-500">Pending Approvals</p>
                     <div className="p-2 bg-red-100 rounded text-red-700"><AlertCircle className="w-4 h-4" /></div>
                  </div>
                  {loading ? (
                     <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-2"></div>
                  ) : (
                     <h3 className="text-2xl font-black text-gray-900 mt-2">{pendingBookings}</h3>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mt-2 flex items-center gap-1">
                     Action Required
                  </p>
               </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-purple-50 to-transparent pointer-events-none"></div>
               <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-semibold text-gray-500">Total Bookings</p>
                     <div className="p-2 bg-purple-100 rounded text-purple-700"><Calendar className="w-4 h-4" /></div>
                  </div>
                  {loading ? (
                     <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-2"></div>
                  ) : (
                     <h3 className="text-2xl font-black text-gray-900 mt-2">{totalBookings}</h3>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mt-2 flex items-center gap-1">
                     Platform Usage
                  </p>
               </CardContent>
            </Card>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Pending Alerts Left Col */}
         <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 px-1 flex items-center gap-2">
               <AlertCircle className="w-5 h-5 text-red-600" /> Action Center
            </h2>
            <Card className="border border-red-200 shadow-sm bg-white overflow-hidden">
               <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-red-800">High Priority</span>
                  <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">{pendingBookings} Items</span>
               </div>
               <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                     <div className="p-4 flex flex-col items-center text-center justify-center min-h-[140px] bg-white">
                        {pendingBookings > 0 ? (
                           <>
                              <div className="p-3 bg-red-100 text-red-600 rounded-full mb-3">
                                 <ListChecks className="w-6 h-6" />
                              </div>
                              <p className="text-sm font-bold text-gray-900">Pending Bookings Need Approval</p>
                              <Button asChild size="sm" className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold w-full">
                                 <Link to="/dashboard/admin/bookings">Review Now</Link>
                              </Button>
                           </>
                        ) : (
                           <>
                              <div className="p-3 bg-green-100 text-green-600 rounded-full mb-3">
                                 <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <p className="text-sm font-bold text-gray-900">All caught up!</p>
                              <p className="text-xs text-gray-500 mt-1">No pending bookings to approve.</p>
                           </>
                        )}
                     </div>
                     <div className="p-4 flex flex-col items-center text-center justify-center min-h-[120px] bg-white hover:bg-gray-50 transition-colors">
                        <Umbrella className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-sm font-bold text-gray-700">Check Leave Requests</p>
                        <Link to="/dashboard/employee/leaves" className="text-xs font-bold text-red-600 mt-2 hover:underline">Manage Leaves →</Link>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Management Grid Right Col */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 px-1">Management Console</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <AdminActionItem
                  title="Employees"
                  description="Manage staff, roles, and access."
                  to="/dashboard/admin/employees"
                  icon={ShieldCheck}
               />
               <AdminActionItem
                  title="Customers"
                  description="View CRM database."
                  to="/dashboard/admin/customers"
                  icon={Users}
               />
               <AdminActionItem
                  title="Services & Pricing"
                  description="Configure catalog and rates."
                  to="/dashboard/admin/services"
                  icon={Settings}
               />
               <AdminActionItem
                  title="Reports & Analytics"
                  description="View daily income and employee perf."
                  to="/dashboard/admin/reports/daily-income"
                  icon={BarChart3}
               />
               <AdminActionItem
                  title="Record Payment"
                  description="Log an offline transaction."
                  to="/dashboard/employee/payments"
                  icon={CreditCard}
               />
               <AdminActionItem
                  title="System Configuration"
                  description="Holidays, travel pricing, settings."
                  to="/dashboard/admin/holidays"
                  icon={Briefcase}
               />
            </div>
         </div>
      </div>
    </div>
  );
};

// Helper icon component
function TrendingUpIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

export default AdminDashboard;
