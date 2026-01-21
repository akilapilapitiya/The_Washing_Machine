import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Trash2,
  TrendingUp,
  Mail,
  Phone,
  Badge,
  AlertCircle,
  CheckCircle,
  X,
  CreditCard,
} from "lucide-react";
import * as employeeService from "@/services/employee.service";
import { COLORS } from "@/lib/colors";

const roleOptions = [
  { value: "junior", label: "Frontline Detailer" },
  { value: "mid", label: "Service Specialist" },
  { value: "senior", label: "Senior Technician" },
  { value: "lead", label: "Floor Manager" },
  { value: "master", label: "Master Detailer" },
  { value: "owner", label: "Strategic Owner" },
];

const levelColors = {
  junior: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  mid: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
  },
  senior: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  lead: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
  },
  master: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
};

const LevelBadge = ({ level }) => {
  const colors = levelColors[level] || levelColors.junior;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-black border-2 ${colors.bg} ${colors.text} ${colors.border} tracking-widest italic`}
    >
      <Badge size={10} className="mr-1" />
      {roleOptions.find((r) => r.value === level)?.label || level}
    </span>
  );
};

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPromoteForm, setShowPromoteForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    telephone: "",
    type: "junior",
    nic: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employee directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    // NIC Validation (Sri Lankan Format: 9 digits + V/v or 12 digits)
    const nicRegex = /^[0-9]{9}[Vv]$|^[0-9]{12}$/;
    if (!nicRegex.test(newEmployee.nic)) {
      setError("Invalid NIC format. Must be 9 digits + V or 12 digits.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await employeeService.addEmployee(newEmployee);

      await fetchEmployees();
      setNewEmployee({
        name: "",
        email: "",
        telephone: "",
        type: "junior",
        nic: "",
      });
      setShowAddForm(false);
      setSuccessMessage("New operative registered successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to register employee:", err);
      setError(err.response?.data?.message || "Failed to register employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromoteEmployee = async (e) => {
    e.preventDefault();

    if (!newRole) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await employeeService.updateEmployee(selectedEmployee.empid, {
        type: newRole,
      });

      await fetchEmployees();
      setShowPromoteForm(false);
      setSelectedEmployee(null);
      setNewRole("");
      setSuccessMessage("Operational rank updated successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update rank:", err);
      setError("Failed to update employee rank.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this employee? This action cannot be undone.",
      )
    ) {
      try {
        await employeeService.deleteEmployee(id);
        await fetchEmployees();
        setSuccessMessage("Employee records purged.");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        console.error("Failed to delete employee:", err);
        setError("Failed to remove employee record.");
      }
    }
  };

  const openPromoteForm = (employee) => {
    setSelectedEmployee(employee);
    setNewRole(employee.emptype);
    setShowPromoteForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
              Force Management
            </p>
            <h1 className="text-3xl font-bold italic tracking-tight uppercase text-gray-900">
              Manage Employees
            </h1>
            <p className="text-gray-600">
              Register, promote, and coordinate your elite service team.
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="h-14 px-8 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-lg shadow-red-200 transition-all duration-300 group"
          >
            <Plus
              size={20}
              className="mr-2 group-hover:rotate-90 transition-transform"
            />
            Add Employee
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-100 rounded-xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle
              size={24}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <p className="text-red-800 font-black uppercase italic tracking-tight text-sm">
                System Error
              </p>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600">
              <X size={24} />
            </button>
          </div>
        )}

        {showSuccess && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle size={24} className="text-red-600" />
            <p className="text-red-900 font-black uppercase italic tracking-tight">
              {successMessage}
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-transparent hover:border-red-200 transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-black italic text-red-600">
                  {employees.length}
                </p>
                <p className="text-xs uppercase font-black text-gray-400 mt-1 tracking-widest">
                  Total Force
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-red-200 transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-black italic text-gray-900">
                  {
                    employees.filter(
                      (e) =>
                        e.emptype === "senior" ||
                        e.emptype === "master" ||
                        e.emptype === "lead",
                    ).length
                  }
                </p>
                <p className="text-xs uppercase font-black text-gray-400 mt-1 tracking-widest">
                  Senior Elite
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-red-200 transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-black italic text-gray-900">
                  {employees.filter((e) => e.emptype === "mid").length}
                </p>
                <p className="text-xs uppercase font-black text-gray-400 mt-1 tracking-widest">
                  Mid-Level
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent hover:border-red-200 transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-black italic text-gray-900">
                  {employees.filter((e) => e.emptype === "junior").length}
                </p>
                <p className="text-xs uppercase font-black text-gray-400 mt-1 tracking-widest">
                  Junior Staff
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table/Cards */}
        <div className="space-y-4">
          {employees.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {employees.map((employee) => (
                <Card
                  key={employee.empid}
                  className="group border-2 border-transparent bg-white shadow-sm hover:border-red-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 h-1 bg-red-600 w-0 group-hover:w-full transition-all duration-500" />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-black text-red-600 tracking-widest mb-1">
                          Operative
                        </p>
                        <CardTitle className="text-xl font-black uppercase italic tracking-tighter leading-none">
                          {employee.empname}
                        </CardTitle>
                        <div className="mt-2">
                          <LevelBadge level={employee.emptype} />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEmployee(employee.empid)}
                        className="h-8 w-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100 shadow-sm"
                        title="Purge records"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                          <Mail size={14} />
                        </div>
                        <span className="text-gray-900 font-bold truncate">
                          {employee.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                          <Phone size={14} />
                        </div>
                        <span className="text-gray-900 font-bold">
                          {employee.emptel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                          <CreditCard size={14} />
                        </div>
                        <span className="text-gray-900 font-mono font-black text-xs uppercase tracking-wider">
                          {employee.empnic}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest pt-2">
                      Enlisted:{" "}
                      {new Date(employee.created_at).toLocaleDateString()}
                    </div>
                    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-dashed">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPromoteForm(employee)}
                        className="h-10 border-2 font-black uppercase italic tracking-widest text-xs hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                      >
                        <TrendingUp size={14} />
                        Reassign Rank
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No employees yet</h3>
                <p className="text-gray-600 mb-4">
                  Add your first employee to get started.
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus size={18} className="mr-2" />
                  Add Employee
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md border-2 border-red-600 shadow-2xl animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-gray-900 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase font-black tracking-widest text-red-500">
                    Recruitment
                  </p>
                  <CardTitle className="text-2xl font-black uppercase italic tracking-tight">
                    Add New Operative
                  </CardTitle>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-600 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleAddEmployee} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs uppercase font-black text-gray-400"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    placeholder="Full Identification"
                    className="h-12 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-bold transition-all"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs uppercase font-black text-gray-400"
                  >
                    Professional Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    placeholder="name@washingmachine.com"
                    className="h-12 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-bold transition-all"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="telephone"
                      className="text-xs uppercase font-black text-gray-400"
                    >
                      Phone *
                    </Label>
                    <Input
                      id="telephone"
                      value={newEmployee.telephone}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          telephone: e.target.value,
                        })
                      }
                      placeholder="0771234567"
                      className="h-12 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-bold transition-all"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="nic"
                      className="text-xs uppercase font-black text-gray-400"
                    >
                      NIC *
                    </Label>
                    <Input
                      id="nic"
                      value={newEmployee.nic}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, nic: e.target.value })
                      }
                      placeholder="ID Number"
                      className="h-12 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-mono font-bold uppercase transition-all"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-xs uppercase font-black text-gray-400"
                  >
                    Operational Rank *
                  </Label>
                  <select
                    id="role"
                    value={newEmployee.type}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, type: e.target.value })
                    }
                    className="w-full h-12 px-3 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-bold transition-all"
                    disabled={submitting}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-[10px] uppercase font-black text-red-600 mb-1">
                    Security Protocol
                  </p>
                  <p className="text-xs font-bold text-red-900 leading-tight">
                    Default password set to:{" "}
                    <span className="font-mono bg-white px-2 py-0.5 rounded border">
                      Employee@123
                    </span>
                  </p>
                </div>

                <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="h-14 px-8 border-2 font-black uppercase tracking-widest hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Abort
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-14 px-10 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-xl shadow-red-200 transition-all duration-300"
                  >
                    {submitting ? "Enlisting..." : "Enlist Operative"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promote Employee Modal */}
      {showPromoteForm && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md border-2 border-red-600 shadow-2xl animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-gray-900 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase font-black tracking-widest text-red-500">
                    Personnel Logistics
                  </p>
                  <CardTitle className="text-2xl font-black uppercase italic tracking-tight">
                    Promote Operative
                  </CardTitle>
                </div>
                <button
                  onClick={() => setShowPromoteForm(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-600 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handlePromoteEmployee} className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">
                    Target Personnel
                  </p>
                  <p className="font-black text-xl text-gray-900 uppercase italic leading-none">
                    {selectedEmployee.empname}
                  </p>
                  <p className="text-xs font-bold text-red-600 mt-2">
                    Current Rank:{" "}
                    <span className="uppercase">
                      {roleOptions.find(
                        (r) => r.value === selectedEmployee.emptype,
                      )?.label || selectedEmployee.emptype}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="newRole"
                    className="text-xs uppercase font-black text-gray-400"
                  >
                    Target Operational Rank *
                  </Label>
                  <select
                    id="newRole"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full h-12 px-3 border-2 border-gray-100 focus:border-red-600 focus:ring-0 rounded-lg font-bold transition-all"
                    required
                    disabled={submitting}
                  >
                    <option value="">-- Select Deployment Rank --</option>
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {newRole && newRole !== selectedEmployee.emptype && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-900 flex items-center gap-2">
                      <TrendingUp size={14} />
                      Ascending from{" "}
                      <span className="uppercase italic">
                        {selectedEmployee.emptype}
                      </span>{" "}
                      to <span className="uppercase italic">{newRole}</span>
                    </p>
                  </div>
                )}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPromoteForm(false)}
                    className="h-14 px-8 border-2 font-black uppercase tracking-widest hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      newRole === selectedEmployee.emptype || submitting
                    }
                    className="h-14 px-10 bg-red-600 hover:bg-black text-white font-black uppercase italic tracking-widest shadow-xl shadow-red-200 transition-all duration-300"
                  >
                    {submitting ? "Processing..." : "Confirm Promotion"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagementPage;
