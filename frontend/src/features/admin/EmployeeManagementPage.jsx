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

// Initial fallback if roles haven't loaded yet
const initialRoleOptions = [
  { value: "owner", label: "Owner" },
  { value: "cashier", label: "Cashier" },
  { value: "employee", label: "Employee" },
];

const levelColors = {
  owner: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  cashier: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
  },
  employee: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
};

const getRoleBadgeInfo = (level, roles) => {
  const role = roles.find((r) => r.rolename === level);
  const colors = levelColors[level] || levelColors.employee;
  return {
    label: role ? role.rolename : level,
    colors,
  };
};

const LevelBadge = ({ level, roles }) => {
  const { label, colors } = getRoleBadgeInfo(level, roles);
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${colors.bg} ${colors.text} ${colors.border} tracking-wider`}
    >
      {label}
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
    type: "employee",
    nic: "",
  });
  const [roles, setRoles] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await employeeService.getRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

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
        type: "employee",
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
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Employees
            </h1>
            <p className="text-gray-600">
              Register, promote, and coordinate your service team.
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200"
          >
            <Plus size={18} className="mr-2" />
            Add Employee
          </Button>
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
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {employees.length}
                </p>
                <p className="text-xs uppercase font-semibold text-gray-500 mt-1 tracking-wider">
                  Total Force
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {employees.filter((e) => e.emptype === "owner").length}
                </p>
                <p className="text-xs uppercase font-semibold text-gray-500 mt-1 tracking-wider">
                  Owners
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {employees.filter((e) => e.emptype === "cashier").length}
                </p>
                <p className="text-xs uppercase font-semibold text-gray-500 mt-1 tracking-wider">
                  Cashiers
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {employees.filter((e) => e.emptype === "employee").length}
                </p>
                <p className="text-xs uppercase font-semibold text-gray-500 mt-1 tracking-wider">
                  Technical Staff
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
                  className="group border border-gray-200 hover:border-red-200 transition-all duration-200 shadow-sm"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
                          Operative
                        </p>
                        <CardTitle className="text-lg font-bold">
                          {employee.empname}
                        </CardTitle>
                        <div className="mt-2">
                          <LevelBadge level={employee.emptype} roles={roles} />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEmployee(employee.empid)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Purge records"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-600 truncate">
                          {employee.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-gray-600">{employee.emptel}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard size={14} className="text-gray-400" />
                        <span className="text-gray-600 font-mono text-xs">
                          {employee.empnic}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        Joined:{" "}
                        {new Date(employee.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPromoteForm(employee)}
                        className="h-8 text-xs font-bold"
                      >
                        <TrendingUp size={12} className="mr-1" />
                        Rank
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="text-center py-20 px-6">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold">No operatives deployed</h3>
                <p className="text-gray-500 mb-6 text-sm max-w-xs mx-auto">
                  Enlist your first team member to start managing detailing
                  operations.
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">
                  Add New Operative
                </CardTitle>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    placeholder="Enter full name..."
                    className="focus:ring-red-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    placeholder="name@example.com"
                    className="focus:ring-red-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="telephone" className="text-sm font-medium">
                      Phone
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
                      className="focus:ring-red-500"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="nic" className="text-sm font-medium">
                      NIC
                    </Label>
                    <Input
                      id="nic"
                      value={newEmployee.nic}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, nic: e.target.value })
                      }
                      placeholder="NIC Number"
                      className="focus:ring-red-500"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Operational Rank
                  </Label>
                  <select
                    id="role"
                    value={newEmployee.type}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, type: e.target.value })
                    }
                    className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-red-500 outline-none capitalize"
                    disabled={submitting}
                  >
                    {roles.length > 0
                      ? roles.map((role) => (
                          <option key={role.roleid} value={role.rolename}>
                            {role.rolename}
                          </option>
                        ))
                      : initialRoleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                  </select>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border text-xs text-gray-600">
                  <p className="font-bold mb-1">Default Password:</p>
                  <code className="bg-white px-1 py-0.5 border rounded">
                    Employee@123
                  </code>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {submitting ? "Processing..." : "Enlist Operative"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promote Employee Modal */}
      {showPromoteForm && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Update Rank</CardTitle>
                <button
                  onClick={() => setShowPromoteForm(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePromoteEmployee} className="space-y-6">
                <div className="text-center space-y-1">
                  <p className="text-lg font-bold">
                    {selectedEmployee.empname}
                  </p>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Current: {selectedEmployee.emptype}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newRole" className="text-sm font-medium">
                    New Operational Rank
                  </Label>
                  <select
                    id="newRole"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-red-500 outline-none capitalize"
                    required
                    disabled={submitting}
                  >
                    <option value="">-- Select Rank --</option>
                    {roles.map((role) => (
                      <option key={role.roleid} value={role.rolename}>
                        {role.rolename}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPromoteForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      newRole === selectedEmployee.emptype || submitting
                    }
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {submitting ? "Updating..." : "Confirm Rank Change"}
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
