import React, { useState } from "react";
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
} from "lucide-react";

// Mock employees data
const mockEmployees = [
  {
    id: "1",
    name: "John Silva",
    email: "john.silva@example.com",
    phone: "+94 77 123 4567",
    role: "Senior Detailer",
    level: "senior",
    joinDate: "2022-03-15",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Fernando",
    email: "sarah.fernando@example.com",
    phone: "+94 77 987 6543",
    role: "Service Specialist",
    level: "mid",
    joinDate: "2023-06-20",
    status: "active",
  },
  {
    id: "3",
    name: "Michael Perera",
    email: "michael.perera@example.com",
    phone: "+94 77 555 1234",
    role: "Lead Technician",
    level: "lead",
    joinDate: "2021-01-10",
    status: "active",
  },
  {
    id: "4",
    name: "Amara Jayasinghe",
    email: "amara.jayasinghe@example.com",
    phone: "+94 77 321 9876",
    role: "Master Detailer",
    level: "master",
    joinDate: "2020-05-05",
    status: "active",
  },
  {
    id: "5",
    name: "Alex Kumar",
    email: "alex.kumar@example.com",
    phone: "+94 77 444 7890",
    role: "Junior Technician",
    level: "junior",
    joinDate: "2024-01-15",
    status: "active",
  },
];

const roleOptions = [
  { value: "junior", label: "Junior Technician" },
  { value: "mid", label: "Service Specialist" },
  { value: "senior", label: "Senior Detailer" },
  { value: "lead", label: "Lead Technician" },
  { value: "master", label: "Master Detailer" },
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
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <Badge size={12} className="mr-1" />
      {roleOptions.find((r) => r.value === level)?.label}
    </span>
  );
};

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState(mockEmployees);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPromoteForm, setShowPromoteForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    role: "junior",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleAddEmployee = (e) => {
    e.preventDefault();

    if (!newEmployee.name || !newEmployee.email || !newEmployee.phone) {
      return;
    }

    const employee = {
      id: Date.now().toString(),
      ...newEmployee,
      level: newEmployee.role,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: "", email: "", phone: "", role: "junior" });
    setShowAddForm(false);
    setSuccessMessage("Employee added successfully!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePromoteEmployee = (e) => {
    e.preventDefault();

    if (!newRole) {
      return;
    }

    const updatedEmployees = employees.map((emp) =>
      emp.id === selectedEmployee.id
        ? {
            ...emp,
            level: newRole,
            role: roleOptions.find((r) => r.value === newRole)?.label,
          }
        : emp
    );

    setEmployees(updatedEmployees);
    setShowPromoteForm(false);
    setSelectedEmployee(null);
    setNewRole("");
    setSuccessMessage("Employee promoted successfully!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteEmployee = (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this employee? This action cannot be undone."
      )
    ) {
      setEmployees(employees.filter((emp) => emp.id !== id));
      setSuccessMessage("Employee removed successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const openPromoteForm = (employee) => {
    setSelectedEmployee(employee);
    setNewRole(employee.level);
    setShowPromoteForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Employee Management
            </p>
            <h1 className="text-3xl font-bold">Manage Employees</h1>
            <p className="text-gray-600">
              Add, promote, and manage your team members.
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Employee
          </Button>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {employees.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Employees</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {
                    employees.filter(
                      (e) =>
                        e.level === "senior" ||
                        e.level === "master" ||
                        e.level === "lead"
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">Senior Staff</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {employees.filter((e) => e.level === "mid").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Mid-Level</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {employees.filter((e) => e.level === "junior").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Junior Staff</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table/Cards */}
        <div className="space-y-4">
          {employees.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {employees.map((employee) => (
                <Card key={employee.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {employee.name}
                        </CardTitle>
                        <LevelBadge level={employee.level} />
                      </div>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                        title="Remove employee"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-500" />
                        <span className="text-gray-700 truncate">
                          {employee.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-500" />
                        <span className="text-gray-700">{employee.phone}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span>
                          Joined:{" "}
                          {new Date(employee.joinDate).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPromoteForm(employee)}
                        className="flex items-center gap-1"
                      >
                        <TrendingUp size={14} />
                        Promote
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="text-gray-500"
                      >
                        Edit
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} className="text-blue-600" />
                  Add New Employee
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
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    placeholder="John Silva"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, phone: e.target.value })
                    }
                    placeholder="+94 77 123 4567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Starting Role *</Label>
                  <select
                    id="role"
                    value={newEmployee.role}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Employee</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promote Employee Modal */}
      {showPromoteForm && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  Promote Employee
                </CardTitle>
                <button
                  onClick={() => setShowPromoteForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePromoteEmployee} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Employee</p>
                  <p className="font-semibold text-lg">
                    {selectedEmployee.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current:{" "}
                    {
                      roleOptions.find(
                        (r) => r.value === selectedEmployee.level
                      )?.label
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newRole">New Role *</Label>
                  <select
                    id="newRole"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Select new role --</option>
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {newRole && newRole !== selectedEmployee.level && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Promoting from{" "}
                      <span className="font-semibold">
                        {
                          roleOptions.find(
                            (r) => r.value === selectedEmployee.level
                          )?.label
                        }
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold">
                        {roleOptions.find((r) => r.value === newRole)?.label}
                      </span>
                    </p>
                  </div>
                )}
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPromoteForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={newRole === selectedEmployee.level}
                  >
                    Promote Employee
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
