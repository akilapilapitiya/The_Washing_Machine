import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Trash2,
  Mail,
  Phone,
  CheckCircle,
  X,
  CreditCard,
  Edit,
  UserCog,
  Shield,
  Briefcase,
  Loader2
} from "lucide-react";
import * as employeeService from "@/services/employee.service";

import { toast } from "sonner";
// Initial fallback if roles haven't loaded yet
const initialRoleOptions = [
  { value: "owner", label: "Owner" },
  { value: "cashier", label: "Cashier" },
  { value: "employee", label: "Employee" },
];

const levelColors = {
  owner: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  cashier: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200"},
  employee: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200"}};

const getRoleBadgeInfo = (level, roles) => {
  const role = roles.find((r) => r.rolename === level);
  const colors = levelColors[level] || levelColors.employee;
  return {
    label: role ? role.rolename : level,
    colors};
};

const LevelBadge = ({ level, roles }) => {
  const { label, colors } = getRoleBadgeInfo(level, roles);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {label}
    </span>
  );
};

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPromoteForm, setShowPromoteForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    telephone: "",
    type: "employee",
    nic: ""});
  const [roles, setRoles] = useState([]);
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
      toast.error(null);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      toast.error("Failed to load employee directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    // NIC Validation (Sri Lankan Format: 9 digits + V/v or 12 digits)
    const nicRegex = /^[0-9]{9}[Vv]$|^[0-9]{12}$/;
    if (!nicRegex.test(newEmployee.nic)) {
      toast.error("Invalid NIC format. Must be 9 digits + V or 12 digits.");
      return;
    }

    try {
      setSubmitting(true);
      toast.error(null);
      await employeeService.addEmployee({
        ...newEmployee,
        password: "Employee@123"});

      await fetchEmployees();
      setNewEmployee({
        name: "",
        email: "",
        telephone: "",
        type: "employee",
        nic: ""});
      setShowAddForm(false);
      setSuccessMessage("New employee registered successfully!");
      toast.success("Operation completed successfully");    } catch (err) {
      console.error("Failed to register employee:", err);
      toast.error(err.response?.data?.message || "Failed to register employee.");
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
      toast.error(null);
      await employeeService.updateEmployee(selectedEmployee.empid, {
        type: newRole});

      await fetchEmployees();
      setShowPromoteForm(false);
      setSelectedEmployee(null);
      setNewRole("");
      setSuccessMessage("Employee role updated successfully!");
      toast.success("Operation completed successfully");    } catch (err) {
      console.error("Failed to update rank:", err);
      toast.error("Failed to update employee role.");
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
        setSuccessMessage("Employee removed.");
        toast.success("Operation completed successfully");      } catch (err) {
        console.error("Failed to delete employee:", err);
        toast.error("Failed to remove employee record.");
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
      <div className="container mx-auto px-4 py-12 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Team Management
            </h1>
            <p className="text-gray-500">
              Register new staff and manage roles.
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium h-10 px-4 rounded-lg shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Add Employee
          </Button>
        </div>

{/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Staff
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {employees.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Owners</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {employees.filter((e) => e.emptype === "owner").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cashiers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {employees.filter((e) => e.emptype === "cashier").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {employees.filter((e) => e.emptype === "employee").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table/Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className="animate-spin text-red-600" />
              <p className="text-sm font-medium text-gray-500">
                Loading directory...
              </p>
            </div>
          ) : employees.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {employees.map((employee) => (
                <Card
                  key={employee.empid}
                  className="group hover:shadow-md transition-all border-gray-200 h-full flex flex-col"
                >
                  <CardHeader className="pb-3 border-b border-gray-50 bg-white pt-5 px-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-gray-900">
                          {employee.empname}
                        </CardTitle>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <LevelBadge level={employee.emptype} roles={roles} />
                          <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-gray-50 rounded border border-gray-100 flex items-center">
                            ID: {employee.empid}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => openPromoteForm(employee)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
                          title="Edit Role"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.empid)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Remove Employee"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 px-5 pb-5 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail size={14} className="text-gray-400 shrink-0" />
                        <span className="text-gray-600 truncate font-medium">
                          {employee.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={14} className="text-gray-400 shrink-0" />
                        <span className="text-gray-600 font-medium">
                          {employee.emptel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CreditCard
                          size={14}
                          className="text-gray-400 shrink-0"
                        />
                        <span className="text-gray-600 font-medium">
                          {employee.empnic}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-dashed border-gray-100 mt-auto">
                      <span className="text-xs text-gray-400 flex items-center gap-1.5">
                        <CheckCircle size={12} />
                        Joined{" "}
                        {new Date(employee.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-white">
              <div className="p-4 bg-gray-50 rounded-full w-max mx-auto mb-4">
                <Users size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No employees yet
              </h3>
              <p className="text-gray-500 mb-6 text-sm">
                Add your first team member to get started.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus size={16} className="mr-2" />
                Add Employee
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <UserCog size={20} />
                  </div>
                  Add New Employee
                </CardTitle>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    placeholder="Enter full name..."
                    className="h-10 focus:ring-red-600 border-gray-300"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    placeholder="name@example.com"
                    className="h-10 focus:ring-red-600 border-gray-300"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="telephone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="telephone"
                      value={newEmployee.telephone}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          telephone: e.target.value})
                      }
                      placeholder="0771234567"
                      className="h-10 focus:ring-red-600 border-gray-300"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="nic"
                      className="text-sm font-medium text-gray-700"
                    >
                      NIC <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nic"
                      value={newEmployee.nic}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, nic: e.target.value })
                      }
                      placeholder="NIC Number"
                      className="h-10 focus:ring-red-600 border-gray-300"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700"
                  >
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="role"
                      value={newEmployee.type}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, type: e.target.value })
                      }
                      className="w-full h-10 pl-3 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none capitalize bg-white appearance-none transition-shadow"
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Default Password:
                  </span>
                  <code className="bg-white px-2 py-1 border rounded text-red-600 font-mono font-bold">
                    Employee@123
                  </code>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                    className="h-10 font-medium text-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-red-600 hover:bg-red-700 text-white h-10 px-6 font-bold shadow-md shadow-red-100"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Add Employee"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promote Employee Modal */}
      {showPromoteForm && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <UserCog size={20} />
                  </div>
                  Update Role
                </CardTitle>
                <button
                  onClick={() => setShowPromoteForm(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePromoteEmployee} className="space-y-6">
                <div className="text-center space-y-2 pb-4 border-b border-gray-100">
                  <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center text-gray-500 mb-3">
                    <span className="text-xl font-bold">
                      {selectedEmployee.empname.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedEmployee.empname}
                  </h3>
                  <div className="inline-flex">
                    <LevelBadge
                      level={selectedEmployee.emptype}
                      roles={roles}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="newRole"
                    className="text-sm font-medium text-gray-700"
                  >
                    New Role <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="newRole"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none capitalize bg-white appearance-none transition-shadow"
                      required
                      disabled={submitting}
                    >
                      <option value="">-- Select Role --</option>
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2 mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPromoteForm(false)}
                    disabled={submitting}
                    className="h-10 font-medium text-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      newRole === selectedEmployee.emptype || submitting
                    }
                    className="bg-red-600 hover:bg-red-700 text-white h-10 px-6 font-bold shadow-md shadow-red-100"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Role"
                    )}
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
