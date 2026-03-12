import React, { useState, useEffect, useMemo } from "react";
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
  Loader2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Award,
  MapPin,
  HeartPulse,
} from "lucide-react";
import * as employeeService from "@/services/employee.service";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { IMAGE_BASE_URL } from "@/configs/env";
import { PageLoader } from "@/components/common/LoadingStates";
import { useSetPageHeader } from "@/contexts/PageHeaderContext";
import DataTable from "@/components/common/DataTable";
import PageToolbar from "@/components/common/PageToolbar";
// Initial fallback if roles haven't loaded yet
const initialRoleOptions = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "employee", label: "Employee" },
];

const levelColors = {
  owner: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  cashier: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  manager: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  employee: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
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
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {label}
    </span>
  );
};

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPromoteForm, setShowPromoteForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    first_name: "",
    last_name: "",
    name_with_initials: "",
    email: "",
    telephone: "",
    type: "employee",
    nic: "",
    address_number: "",
    address_line1: "",
    address_line2: "",
    dob: "",
    speciality: "",
  });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [, setSuccessMessage] = useState("");
  const { confirm, Dialog: ConfirmDialog } = useConfirmDialog();

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
    setErrors({});

    // Comprehensive Validation
    const newErrors = {};
    if (!newEmployee.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!newEmployee.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!newEmployee.name_with_initials.trim())
      newErrors.name_with_initials = "Name with initials is required";
    if (!newEmployee.email.trim()) newErrors.email = "Email is required";
    else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(newEmployee.email)
    )
      newErrors.email = "Invalid email format";

    if (!newEmployee.telephone.trim())
      newErrors.telephone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(newEmployee.telephone))
      newErrors.telephone = "Must be exactly 10 digits";

    const nicRegex = /^[0-9]{9}[Vv]$|^[0-9]{12}$/;
    if (!newEmployee.nic.trim()) newErrors.nic = "NIC is required";
    else if (!nicRegex.test(newEmployee.nic))
      newErrors.nic = "Invalid NIC format (9 digits + V/v or 12 digits)";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the highlighted errors.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...newEmployee,
        password: "Employee@123", // Default administrative password
        dob: newEmployee.dob || null,
        address_number: newEmployee.address_number || null,
        address_line1: newEmployee.address_line1 || null,
        address_line2: newEmployee.address_line2 || null,
        speciality: newEmployee.speciality || null,
      };
      await employeeService.addEmployee(payload);

      await fetchEmployees();
      setNewEmployee({
        first_name: "",
        last_name: "",
        name_with_initials: "",
        email: "",
        telephone: "",
        type: "employee",
        nic: "",
        address_number: "",
        address_line1: "",
        address_line2: "",
        dob: "",
        speciality: "",
      });
      setShowAddForm(false);
      toast.success("New employee registered successfully!");
    } catch (err) {
      console.error("Failed to register employee:", err);
      toast.error(
        err.response?.data?.message || "Failed to register employee.",
      );
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
      await employeeService.updateEmployee(selectedEmployee.empid, {
        emptype: newRole,
      });

      await fetchEmployees();
      setShowPromoteForm(false);
      setSelectedEmployee(null);
      setNewRole("");
      setSuccessMessage("Employee role updated successfully!");
      toast.success("Operation completed successfully");
    } catch (err) {
      console.error("Failed to update rank:", err);
      toast.error("Failed to update employee role.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    const confirmed = await confirm({
      variant: "destructive",
      title: "Remove Employee?",
      description:
        "Are you sure you want to remove this employee? This action cannot be undone.",
      confirmText: "Remove",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await employeeService.deleteEmployee(id);
      await fetchEmployees();
      setSuccessMessage("Employee removed.");
      toast.success("Operation completed successfully");
    } catch (err) {
      console.error("Failed to delete employee:", err);
      toast.error("Failed to remove employee record.");
    }
  };

  const openPromoteForm = (employee) => {
    setSelectedEmployee(employee);
    setNewRole(employee.emptype);
    setShowPromoteForm(true);
  };

  // Memoize action button for stable reference
  const headerAction = React.useMemo(() => (
    <Button
      onClick={() => setShowAddForm(true)}
      className="bg-red-600 hover:bg-red-700 text-white font-medium h-10 px-4 rounded-lg"
    >
      <Plus size={16} className="mr-2" />
      Add Employee
    </Button>
  ), []);

  // Toolbar: Stat Pills
  const toolbar = useMemo(
    () => (
      <PageToolbar
        stats={[
          { icon: Users, label: "Total", value: employees.length, iconClassName: "text-gray-500" },
          { icon: Shield, label: "Owners", value: employees.filter((e) => e.emptype === "owner").length, iconClassName: "text-red-500" },
          { icon: CreditCard, label: "Cashiers", value: employees.filter((e) => e.emptype === "cashier").length, iconClassName: "text-purple-500" },
          { icon: Briefcase, label: "Staff", value: employees.filter((e) => e.emptype === "employee").length, iconClassName: "text-blue-500" },
        ]}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search employees..."
        searchWidthClass="sm:w-80"
      />
    ),
    [employees, searchQuery],
  );

  useSetPageHeader(
    "Staff",
    "Team Management",
    "Register new staff and manage roles.",
    headerAction,
    toolbar,
  );

  const columns = [
    {
      key: "employee",
      label: "Employee & ID",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {row.profile_picture_url ? (
              <img
                src={`${IMAGE_BASE_URL}${row.profile_picture_url}`}
                alt={row.empname}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold border-2 border-white shadow-sm text-xs">
                {row.first_name?.[0]}
                {row.last_name?.[0]}
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{row.empname}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">
              ID: #{row.empid}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact Details",
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Mail size={12} className="text-gray-400" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Phone size={12} className="text-gray-400" />
            <span>{row.emptel}</span>
          </div>
        </div>
      ),
    },
    {
      key: "rank",
      label: "Rank & Role",
      render: (row) => <LevelBadge level={row.emptype} roles={roles} />,
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
              setSelectedEmployee(row);
              setExpandedId(row.empid);
            }}
            variant="ghost"
            className="h-8 px-3 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 hover:text-red-700 bg-red-50/30 rounded-lg"
          >
            More Info
          </Button>
          <button
            onClick={() => openPromoteForm(row)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Update Role"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteEmployee(row.empid)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Terminate"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Employees Table */}
        <div className="space-y-4">
          {loading ? (
            <PageLoader message="Loading directory..." />
          ) : employees.length > 0 ? (
            <>
              <DataTable
                columns={columns}
                data={employees.filter((employee) => {
                  const query = searchQuery.trim().toLowerCase();
                  if (!query) return true;

                  return [
                    employee.empname,
                    employee.email,
                    employee.emptel,
                    employee.emptype,
                    employee.empid,
                  ].some((value) => String(value || "").toLowerCase().includes(query));
                })}
                keyField="empid"
                emptyIcon={Users}
                emptyTitle="No staff found"
                emptySubtitle={searchQuery ? "No staff match your search." : "Your employee directory is empty."}
              />

              {/* Employee Detail Modal */}
              {expandedId && selectedEmployee && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200 overflow-y-auto">
                  <Card className="w-full max-w-4xl shadow-2xl border-0 overflow-hidden my-auto">
                    <div className="bg-red-600 h-1.5" />
                    <CardHeader className="p-8 pb-4 border-b border-gray-50 flex flex-row items-center justify-between bg-white text-gray-900">
                      <div className="flex gap-6 items-center">
                        <div className="relative shrink-0">
                          {selectedEmployee.profile_picture_url ? (
                            <img
                              src={`${IMAGE_BASE_URL}${selectedEmployee.profile_picture_url}`}
                              alt={selectedEmployee.empname}
                              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
                              {selectedEmployee.first_name?.[0]}
                              {selectedEmployee.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold tracking-tight">
                              {selectedEmployee.empname}
                            </h3>
                            <LevelBadge
                              level={selectedEmployee.emptype}
                              roles={roles}
                            />
                          </div>
                          <p className="text-gray-500 font-semibold flex items-center gap-2 text-sm uppercase tracking-wider">
                            {selectedEmployee.name_with_initials}
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            ID #{selectedEmployee.empid}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setExpandedId(null);
                          setSelectedEmployee(null);
                        }}
                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all font-bold"
                      >
                        <X size={24} />
                      </button>
                    </CardHeader>

                    <CardContent className="p-8 bg-white grid md:grid-cols-3 gap-10">
                      {/* Personal Section */}
                      <div className="space-y-6 text-gray-600">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-4">
                          Staff Identity
                        </h5>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors shrink-0">
                              <Shield size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                NIC Number
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {selectedEmployee.empnic}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors shrink-0">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Date of Birth
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {selectedEmployee.dob
                                  ? new Date(
                                    selectedEmployee.dob,
                                  ).toLocaleDateString()
                                  : "Not Provided"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors shrink-0">
                              <Award size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Speciality
                              </p>
                              <p className="text-sm font-semibold text-gray-900 leading-tight">
                                {selectedEmployee.speciality ||
                                  "Standard Staff"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Section */}
                      <div className="space-y-6">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-4">
                          Contact & Residence
                        </h5>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors shrink-0">
                              <Mail size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Email Address
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {selectedEmployee.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors shrink-0">
                              <Phone size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Mobile Number
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {selectedEmployee.emptel}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors shrink-0">
                              <MapPin size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Registered Address
                              </p>
                              <p className="text-sm font-semibold text-gray-900 leading-snug">
                                {selectedEmployee.address_number},{" "}
                                {selectedEmployee.address_line1}
                                <br />
                                {selectedEmployee.address_line2}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dependents Section */}
                      <div className="space-y-6">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-4">
                          Emergency Contacts
                        </h5>
                        <div className="space-y-3">
                          {selectedEmployee.dependents &&
                            selectedEmployee.dependents.length > 0 ? (
                            selectedEmployee.dependents.map((dep, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-1 border-l-4 border-l-red-100 shadow-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-gray-900 uppercase">
                                    {dep.name}
                                  </p>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                    {dep.relationship}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-gray-600">
                                  {dep.contact_number}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm font-medium text-gray-400 italic">
                              No emergency contacts provided.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 bg-white rounded border flex items-center gap-2">
                        <CheckCircle size={12} className="text-green-500" />{" "}
                        Joined{" "}
                        {new Date(
                          selectedEmployee.created_at,
                        ).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setExpandedId(null);
                            openPromoteForm(selectedEmployee);
                          }}
                          variant="outline"
                          className="h-9 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider text-gray-600 border-gray-200"
                        >
                          Manage Role
                        </Button>
                        <Button
                          onClick={() => {
                            setExpandedId(null);
                            handleDeleteEmployee(selectedEmployee.empid);
                          }}
                          variant="ghost"
                          className="h-9 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider text-red-600 hover:bg-red-50"
                        >
                          Terminate
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
                </>
              ) : (
                <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-xl bg-white shadow-sm">
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
                    className="bg-red-600 hover:bg-red-700 font-bold"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Employee
                  </Button>
                </div>
              )}
            </div>
          </div>
      {/* Add Employee Modal */}
      {
        showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl shadow-2xl border-0 overflow-hidden">
              <CardHeader className="border-b border-gray-100 pb-4 bg-white/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                      <UserCog size={22} />
                    </div>
                    Register New Team Member
                  </CardTitle>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <form
                  onSubmit={handleAddEmployee}
                  className="flex flex-col max-h-[85vh]"
                >
                  <div className="p-6 space-y-8 overflow-y-auto scrollbar-thin">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                        Personal Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="first_name"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                          >
                            First Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="first_name"
                            value={newEmployee.first_name}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                first_name: e.target.value,
                              })
                            }
                            placeholder="First Name"
                            className={`h-10 text-sm font-semibold rounded-lg ${errors.first_name ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                            disabled={submitting}
                          />
                          {errors.first_name && (
                            <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                              {errors.first_name}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="last_name"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                          >
                            Last Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="last_name"
                            value={newEmployee.last_name}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                last_name: e.target.value,
                              })
                            }
                            placeholder="Last Name"
                            className={`h-10 text-sm font-semibold rounded-lg ${errors.last_name ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                            disabled={submitting}
                          />
                          {errors.last_name && (
                            <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                              {errors.last_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="name_with_initials"
                          className="text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                        >
                          Name with Initials{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name_with_initials"
                          value={newEmployee.name_with_initials}
                          onChange={(e) =>
                            setNewEmployee({
                              ...newEmployee,
                              name_with_initials: e.target.value,
                            })
                          }
                          placeholder="Full Name with Initials"
                          className={`h-10 text-sm font-semibold rounded-lg ${errors.name_with_initials ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                          disabled={submitting}
                        />
                        {errors.name_with_initials && (
                          <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                            {errors.name_with_initials}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="nic"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                          >
                            NIC Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="nic"
                            value={newEmployee.nic}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                nic: e.target.value,
                              })
                            }
                            placeholder="NIC Number"
                            className={`h-10 text-sm font-semibold rounded-lg uppercase ${errors.nic ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                            disabled={submitting}
                          />
                          {errors.nic && (
                            <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                              {errors.nic}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="dob"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                          >
                            Date of Birth
                          </Label>
                          <Input
                            id="dob"
                            type="date"
                            value={newEmployee.dob}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                dob: e.target.value,
                              })
                            }
                            max={new Date().toISOString().split("T")[0]}
                            className="h-10 text-sm font-semibold rounded-lg border-gray-200"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                        Contact & Identification
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="email"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                          >
                            Email Address <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={newEmployee.email}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                email: e.target.value,
                              })
                            }
                            placeholder="Email Address"
                            className={`h-10 text-sm font-semibold rounded-lg ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                            disabled={submitting}
                          />
                          {errors.email && (
                            <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="telephone"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                          >
                            Phone Number <span className="text-red-500">*</span>
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
                            placeholder="Phone Number (10 digits)"
                            className={`h-10 text-sm font-semibold rounded-lg ${errors.telephone ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                            disabled={submitting}
                          />
                          {errors.telephone && (
                            <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                              {errors.telephone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                        Home Address
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5 col-span-1">
                          <Label
                            htmlFor="address_number"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                          >
                            No.
                          </Label>
                          <Input
                            id="address_number"
                            value={newEmployee.address_number}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                address_number: e.target.value,
                              })
                            }
                            placeholder="No."
                            className="h-10 text-sm font-semibold rounded-lg border-gray-200"
                            disabled={submitting}
                          />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <Label
                            htmlFor="address_line1"
                            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                          >
                            Address Line 1
                          </Label>
                          <Input
                            id="address_line1"
                            value={newEmployee.address_line1}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                address_line1: e.target.value,
                              })
                            }
                            placeholder="Street Address"
                            className="h-10 text-sm font-semibold rounded-lg border-gray-200"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="address_line2"
                          className="text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                        >
                          Address Line 2 (City)
                        </Label>
                        <Input
                          id="address_line2"
                          value={newEmployee.address_line2}
                          onChange={(e) =>
                            setNewEmployee({
                              ...newEmployee,
                              address_line2: e.target.value,
                            })
                          }
                          placeholder="City / Town"
                          className="h-10 text-sm font-semibold rounded-lg border-gray-200"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="space-y-4 pb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                        Professional Role
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="role"
                            className="text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                          >
                            Assigned Role <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <select
                              id="role"
                              value={newEmployee.type}
                              onChange={(e) =>
                                setNewEmployee({
                                  ...newEmployee,
                                  type: e.target.value,
                                })
                              }
                              className="w-full h-10 pl-3 pr-8 border border-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none capitalize bg-white appearance-none transition-all"
                              disabled={submitting}
                            >
                              {roles.length > 0
                                ? roles.map((role) => (
                                  <option
                                    key={role.roleid}
                                    value={role.rolename}
                                  >
                                    {role.rolename}
                                  </option>
                                ))
                                : initialRoleOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                              <ChevronRight size={14} className="rotate-90" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="speciality"
                            className="text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                          >
                            Speciality / Expertise
                          </Label>
                          <Input
                            id="speciality"
                            value={newEmployee.speciality}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                speciality: e.target.value,
                              })
                            }
                            placeholder="Professional Speciality"
                            className="h-10 text-sm font-semibold rounded-lg border-gray-200"
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center justify-between shadow-inner">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-gray-900 uppercase tracking-tighter">
                            Default Access Password
                          </span>
                          <span>
                            Management will change this upon first login
                          </span>
                        </div>
                        <code className="bg-white px-3 py-1.5 border rounded-lg text-red-600 font-mono font-bold text-sm">
                          Employee@123
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex gap-3 justify-end items-center mt-auto">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      disabled={submitting}
                      className="px-6 h-11 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-red-600 hover:bg-red-700 text-white h-11 px-10 rounded-lg font-bold transition-all active:scale-95"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Promote Employee Modal */}
      {
        showPromoteForm && selectedEmployee && (
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
                      className="bg-red-600 hover:bg-red-700 text-white h-10 px-6 font-bold"
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
        )
      }
      <ConfirmDialog />
    </>
  );
};

export default EmployeeManagementPage;
