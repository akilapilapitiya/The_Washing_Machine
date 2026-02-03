import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  UserCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Edit,
  X,
  MapPin,
  ShieldCheck,
  Loader2,
  Lock,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateCustomer,
  updateProfilePicture,
  deleteCustomer,
  changePassword,
  getCustomer,
} from "@/services/customer.service";
import { Camera } from "lucide-react";
import { IMAGE_BASE_URL } from "@/configs/env";
import {
  updateEmployee,
  getEmployee,
  updateEmployeeProfilePicture,
  changePassword as employeeChangePassword,
} from "@/services/employee.service";

const ProfilePage = () => {
  const { user, updateUser, userType, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: user?.title || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    mobile: user?.mobile || "",
    nic: user?.nic || "",
    dob: user?.dob ? user.dob.split("T")[0] : "",
    nameWithInitials: user?.nameWithInitials || "",
    addressNumber: user?.addressNumber || "",
    addressLine1: user?.addressLine1 || "",
    addressLine2: user?.addressLine2 || "",
    speciality: user?.speciality || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Fetch fresh profile data on mount
  useEffect(() => {
    const fetchFreshData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        console.log(`Fetching fresh profile for ${userType} ID:`, user.id);
        let profile;
        let normalized = { ...user };

        if (userType === "customer") {
          profile = await getCustomer(user.id);
          if (profile) {
            normalized = {
              ...user,
              id: profile.cusid,
              title: profile.title,
              firstName: profile.first_name,
              lastName: profile.last_name,
              name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
              mobile: profile.custel,
              nic: profile.nic,
              dob: profile.dob,
              email: profile.cusemail,
              profile_picture_url: profile.profile_picture_url,
              latitude: profile.latitude,
              longitude: profile.longitude,
            };
          }
        } else if (
          userType === "employee" ||
          userType === "cashier" ||
          userType === "owner"
        ) {
          profile = await getEmployee(user.id);
          if (profile) {
            normalized = {
              ...user,
              id: profile.empid,
              firstName: profile.first_name,
              lastName: profile.last_name,
              name: profile.empname,
              nameWithInitials: profile.name_with_initials,
              mobile: profile.emptel,
              nic: profile.empnic,
              dob: profile.dob,
              email: profile.email,
              speciality: profile.speciality,
              addressNumber: profile.address_number,
              addressLine1: profile.address_line1,
              addressLine2: profile.address_line2,
              profile_picture_url: profile.profile_picture_url,
              dependents: profile.dependents,
            };
          }
        }

        if (profile) {
          updateUser(normalized);
          setFormData({
            title: normalized.title || "",
            firstName: normalized.firstName || "",
            lastName: normalized.lastName || "",
            nameWithInitials: normalized.nameWithInitials || "",
            mobile: normalized.mobile || "",
            nic: normalized.nic || "",
            dob: normalized.dob ? normalized.dob.split("T")[0] : "",
            addressNumber: normalized.addressNumber || "",
            addressLine1: normalized.addressLine1 || "",
            addressLine2: normalized.addressLine2 || "",
            speciality: normalized.speciality || "",
          });
        }
      } catch (error) {
        console.error("Failed to refresh profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFreshData();
  }, [user?.id, userType]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setIsLoading(true);
    try {
      let updatedProfile;
      if (userType === "customer") {
        updatedProfile = await updateProfilePicture(user.id, file);
      } else {
        updatedProfile = await updateEmployeeProfilePicture(user.id, file);
      }
      updateUser({
        ...user,
        profile_picture_url: updatedProfile.profile_picture_url,
      });
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Photo upload failed:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      if (userType === "customer") {
        await changePassword(
          user.id,
          passwordForm.oldPassword,
          passwordForm.newPassword,
        );
      } else {
        await employeeChangePassword(
          user.id,
          passwordForm.oldPassword,
          passwordForm.newPassword,
        );
      }
      toast.success("Password changed successfully");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (userType === "customer") {
        const updatedProfile = await updateCustomer(user.id, {
          telephone: formData.mobile,
        });
        updateUser({
          ...user,
          mobile: updatedProfile.custel,
        });
      } else {
        await updateEmployee(user.id, {
          emptel: formData.mobile,
          address_number: formData.addressNumber,
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2,
        });
        updateUser({
          ...user,
          mobile: formData.mobile,
          addressNumber: formData.addressNumber,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
        });
      }
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: user?.title || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      mobile: user?.mobile || "",
      nic: user?.nic || "",
      dob: user?.dob ? user.dob.split("T")[0] : "",
      nameWithInitials: user?.nameWithInitials || "",
      addressNumber: user?.addressNumber || "",
      addressLine1: user?.addressLine1 || "",
      addressLine2: user?.addressLine2 || "",
      speciality: user?.speciality || "",
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      try {
        await deleteCustomer(user.id);
        toast.success("Account deleted successfully");
        logout();
      } catch (error) {
        toast.error("Failed to delete account");
      }
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">
            {userType === "customer" ? "Customer Portal" : "Management Portal"}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Profile Settings
          </h1>
          <p className="text-gray-500 font-medium">
            Manage your{" "}
            {userType === "customer" ? "account" : "professional identity"} and
            personal information.
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-200 transition-all duration-300"
          >
            <Edit size={16} className="mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-12 items-start">
        {/* Left Column: Profile Card & Quick Info */}
        <div className="md:col-span-4 space-y-6">
          <Card className="shadow-lg border border-gray-100 overflow-hidden rounded-xl bg-white">
            <div className="h-24 bg-gradient-to-r from-red-600 to-red-500" />
            <CardContent className="relative pt-0 pb-8 px-6">
              <div className="flex flex-col items-center text-center -mt-12">
                <div className="relative group mb-6">
                  <div className="w-28 h-28 bg-white p-1 rounded-full shadow-xl border-4 border-white overflow-hidden ring-4 ring-red-50">
                    {user?.profile_picture_url ? (
                      <img
                        src={`${IMAGE_BASE_URL}${user.profile_picture_url}`}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-full text-gray-400">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-1 right-1 bg-red-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-red-700 transition-all duration-300 transform group-hover:scale-110"
                  >
                    <Camera size={14} />
                    <input
                      id="photo-upload"
                      type="file"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      disabled={isLoading}
                    />
                  </label>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                  {user?.title} {user?.name}
                </h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 bg-red-50 text-red-700 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-red-100">
                    {userType}
                  </span>
                  {user?.speciality && (
                    <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-wider rounded-full">
                      {user.speciality}
                    </span>
                  )}
                </div>

                <div className="w-full mt-8 pt-6 border-t border-gray-100 space-y-4 text-left">
                  <div className="flex items-center gap-4 text-gray-600 group">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-red-50 transition-colors">
                      <Mail size={16} className="group-hover:text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide">
                        Email Address
                      </p>
                      <p className="text-sm font-semibold truncate text-gray-700">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 group">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-red-50 transition-colors">
                      <Phone size={16} className="group-hover:text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide">
                        Mobile Phone
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {user?.mobile}
                      </p>
                    </div>
                  </div>
                  {user?.nic && (
                    <div className="flex items-center gap-4 text-gray-600 group">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-red-50 transition-colors">
                        <ShieldCheck
                          size={16}
                          className="group-hover:text-red-600"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide">
                          Identity (NIC)
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
                          {user.nic}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts Card (For Employees) */}
          {(userType === "employee" ||
            userType === "owner" ||
            userType === "cashier") &&
            user?.dependents?.length > 0 && (
              <Card className="shadow-md border border-gray-100 rounded-xl overflow-hidden bg-white">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <Phone size={14} className="text-red-600" /> Emergency
                    Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {[
                    ...new Map(
                      user.dependents.map((item) => [item.name, item]),
                    ).values(),
                  ].map((dep, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-xl space-y-1 relative group"
                    >
                      <p className="font-semibold text-gray-800 text-sm">
                        {dep.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">
                        {dep.relationship}
                      </p>
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1">
                        <Phone size={10} /> {dep.contact_number}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          {/* Account Status Card (For Customers) */}
          {userType === "customer" && (
            <Card className="shadow-md border border-gray-100 rounded-xl overflow-hidden bg-white">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-600" /> Account
                  Trust
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      Verified Member
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Since {new Date(user?.created_at).getFullYear()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Detailed Info & Forms */}
        <div className="md:col-span-8 space-y-8">
          <Card className="shadow-lg border border-gray-100 rounded-xl overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-100 p-6 bg-white flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <UserCircle size={20} />
                </div>
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {!isEditing ? (
                <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Legal / Official Name
                    </Label>
                    <div className="flex items-center gap-3 py-2 border-b border-gray-100 hover:border-red-200 transition-colors group">
                      <User
                        size={16}
                        className="text-gray-400 group-hover:text-red-500"
                      />
                      <p className="font-bold text-gray-800">
                        {userType === "customer"
                          ? `${user?.title} ${user?.name}`
                          : user?.nameWithInitials || user?.name}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Date of Birth
                    </Label>
                    <div className="flex items-center gap-3 py-2 border-b border-gray-100 hover:border-red-200 transition-colors group">
                      <Calendar
                        size={16}
                        className="text-gray-400 group-hover:text-red-500"
                      />
                      <p className="font-semibold text-gray-800">
                        {user?.dob
                          ? new Date(user.dob).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  {userType !== "customer" && (
                    <div className="md:col-span-2 space-y-4">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Residential Address
                      </Label>
                      <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm h-fit">
                          <MapPin size={20} className="text-red-600" />
                        </div>
                        <div className="space-y-1 font-semibold text-gray-700">
                          <p className="text-lg">{user?.addressNumber}</p>
                          <p className="text-gray-600">{user?.addressLine1}</p>
                          <p className="text-gray-400 font-medium">
                            {user?.addressLine2}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {userType === "customer" && (
                    <div className="md:col-span-2 space-y-4">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Service Territory
                      </Label>
                      <div className="rounded-xl overflow-hidden border border-gray-100 h-[240px] bg-gray-100 shadow-inner">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.58290458633!2d79.786164!3d6.927079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a70ad%3A0x2db30c0635313b24!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          className="grayscale opacity-60"
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {userType !== "customer" && (
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Areas of Expertise
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {user?.speciality?.split(",").map((s, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg"
                          >
                            {s.trim()}
                          </span>
                        )) || (
                          <span className="px-4 py-2 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-lg">
                            General Services
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 opacity-60">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        First Name
                      </Label>
                      <div className="h-11 px-4 flex items-center bg-gray-50 border border-gray-100 rounded-lg font-semibold text-gray-900 border-dashed">
                        {formData.firstName}
                      </div>
                    </div>
                    <div className="space-y-2 opacity-60">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Last Name
                      </Label>
                      <div className="h-11 px-4 flex items-center bg-gray-50 border border-gray-100 rounded-lg font-semibold text-gray-900 border-dashed">
                        {formData.lastName}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
                        Mobile Number
                      </Label>
                      <Input
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="h-11 rounded-lg border-gray-200 focus:ring-red-500 transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-2 opacity-60">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Date of Birth
                      </Label>
                      <div className="h-11 px-4 flex items-center bg-gray-50 border border-gray-100 rounded-lg font-semibold text-gray-900 border-dashed">
                        {formData.dob}
                      </div>
                    </div>

                    {userType !== "customer" && (
                      <>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
                            Address No.
                          </Label>
                          <Input
                            name="addressNumber"
                            value={formData.addressNumber}
                            onChange={handleInputChange}
                            className="h-11 rounded-lg border-gray-200 focus:ring-red-500 transition-all font-semibold"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
                            Address Line 1
                          </Label>
                          <Input
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                            className="h-11 rounded-lg border-gray-200 focus:ring-red-500 transition-all font-semibold"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
                            Address Line 2 (City)
                          </Label>
                          <Input
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            className="h-11 rounded-lg border-gray-200 focus:ring-red-500 transition-all font-semibold"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancel}
                      className="rounded-lg font-semibold h-11 px-6 text-gray-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold h-11 px-10 shadow-md shadow-red-100 transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Password Management */}
          <Card className="shadow-lg border border-gray-100 rounded-xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                  <Lock size={20} />
                </div>
                Security & Access
              </CardTitle>
              <Button
                variant="ghost"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="rounded-lg hover:bg-gray-50 text-gray-500"
              >
                {showPasswordForm ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!showPasswordForm ? (
                <div className="p-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">Security Checkup</p>
                    <p className="text-sm text-gray-500 font-medium">
                      Last time you changed your password was...
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPasswordForm(true)}
                    className="bg-gray-900 hover:bg-red-600 text-white rounded-lg font-bold px-6 h-11 transition-all"
                  >
                    Update Password
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-12">
                  <div className="md:col-span-4 bg-gray-50/50 p-8 border-r border-gray-100">
                    <div className="p-3 bg-white w-fit rounded-xl shadow-sm mb-4">
                      <Lock size={20} className="text-red-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Updating your credentials
                    </h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      To maintain a high security level, we recommend using a
                      unique, complex password that you don't use elsewhere.
                    </p>
                  </div>
                  <form
                    onSubmit={handlePasswordChange}
                    className="md:col-span-8 p-8 space-y-6"
                  >
                    <div className="space-y-2">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          name="oldPassword"
                          type={showOldPassword ? "text" : "password"}
                          value={passwordForm.oldPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="••••••••"
                          className="h-11 px-4 pr-10 rounded-lg border-gray-200 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showOldPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="••••••••"
                            className="h-11 px-4 pr-10 rounded-lg border-gray-200 font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Confirm New Password
                        </Label>
                        <Input
                          name="confirmPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="••••••••"
                          className="h-11 px-4 rounded-lg border-gray-200 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({
                            oldPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <Button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold px-8 h-11 shadow-md shadow-red-100 transition-all flex items-center gap-2 group"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <>
                            Apply Changes <ArrowRight size={16} />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {userType === "customer" && (
            <Card className="shadow-md border border-red-100 rounded-xl overflow-hidden bg-white">
              <CardHeader className="bg-red-50/30 border-b border-red-100 p-6">
                <CardTitle className="text-lg font-bold text-red-600 flex items-center gap-3">
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <p className="font-semibold text-gray-900">
                    Delete My Account
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    Permanently remove all your data from the portal. This is
                    non-reversible.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="rounded-lg font-bold px-8 h-11 shadow-sm transition-all duration-200"
                >
                  Terminate Account
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
