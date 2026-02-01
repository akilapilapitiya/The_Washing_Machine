import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  getCustomer,
  updateCustomer,
  updateProfilePicture,
  deleteCustomer,
} from "@/services/customer.service";
import { Camera } from "lucide-react";
import { IMAGE_BASE_URL } from "@/configs/env";
import { updateEmployee } from "@/services/employee.service";

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
  });

  // Fetch fresh profile data on mount for customers
  useEffect(() => {
    const fetchFreshData = async () => {
      if (userType === "customer" && user?.id) {
        setIsLoading(true);
        try {
          console.log("Fetching fresh profile for user ID:", user.id);
          const profile = await getCustomer(user.id);
          console.log("Raw profile data from backend:", profile);

          if (!profile) return;

          const normalized = {
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

          console.log("Normalized user data for state:", normalized);
          updateUser(normalized);

          setFormData({
            title: profile.title || "",
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            mobile: profile.custel || "",
            nic: profile.nic || "",
            dob: profile.dob ? profile.dob.split("T")[0] : "",
          });
        } catch (error) {
          console.error("Failed to refresh profile:", error);
        } finally {
          setIsLoading(false);
        }
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
      const updatedProfile = await updateProfilePicture(user.id, file);
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
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          telephone: formData.mobile,
          nic: formData.nic,
        });
        updateUser({
          ...user,
          title: updatedProfile.title,
          firstName: updatedProfile.first_name,
          lastName: updatedProfile.last_name,
          name: `${updatedProfile.first_name || ""} ${updatedProfile.last_name || ""}`.trim(),
          mobile: updatedProfile.custel,
          nic: updatedProfile.nic,
          dob: updatedProfile.dob,
        });
      } else {
        await updateEmployee(user.id, {
          empname: `${formData.firstName} ${formData.lastName}`.trim(),
          emptel: formData.mobile,
        });
        updateUser({
          ...user,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          mobile: formData.mobile,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Account Settings
          </p>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">
            View and manage your account information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <UserCircle size={18} className="text-red-600" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-200 overflow-hidden">
                    {user?.profile_picture_url ? (
                      <img
                        src={`${IMAGE_BASE_URL}${user.profile_picture_url}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <User size={48} className="text-white" />
                    )}
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-4 right-0 bg-white p-1.5 rounded-full shadow-md border cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Camera size={14} className="text-gray-600" />
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
                <h3 className="text-xl font-bold">
                  {user?.title} {user?.name}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="mt-3 px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest border border-red-100 rounded-full">
                  {userType === "employee" ? "Employee" : "Customer"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info Card */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <ShieldCheck size={18} className="text-red-600" />
                Basic Information
              </CardTitle>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <Edit size={14} className="mr-1" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {!isEditing ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase text-gray-400">
                      Full Name
                    </Label>
                    <p className="font-semibold text-gray-700 p-3 bg-gray-50 rounded-lg border">
                      {user?.title} {user?.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase text-gray-400">
                      Mobile Number
                    </Label>
                    <p className="font-semibold text-gray-700 p-3 bg-gray-50 rounded-lg border">
                      {user?.mobile}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase text-gray-400">
                      NIC
                    </Label>
                    <p className="font-semibold text-gray-700 p-3 bg-gray-50 rounded-lg border">
                      {user?.nic || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase text-gray-400">
                      Date of Birth
                    </Label>
                    <p className="font-semibold text-gray-700 p-3 bg-gray-50 rounded-lg border">
                      {user?.dob
                        ? new Date(user.dob).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-bold uppercase text-gray-400">
                      Email Address
                    </Label>
                    <p className="font-semibold text-gray-700 p-3 bg-gray-50 rounded-lg border">
                      {user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <select
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select Title</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Ven.">Ven.</option>
                        <option value="Rev.">Rev.</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="0771234567"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nic">NIC</Label>
                      <Input
                        id="nic"
                        name="nic"
                        value={formData.nic}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth (Read-only)</Label>
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        disabled
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700"
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
        </div>

        {/* Mock Map Section */}
        {userType === "customer" && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <MapPin size={18} className="text-red-600" />
                Service Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg overflow-hidden border h-[300px] bg-gray-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.58290458633!2d79.786164!3d6.927079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a70ad%3A0x2db30c0635313b24!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  className="grayscale opacity-70"
                ></iframe>
              </div>
              <p className="text-xs text-gray-500 italic">
                This location is used for service pickups and deliveries.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        {userType === "customer" && (
          <Card className="shadow-sm border-red-100">
            <CardHeader className="bg-red-50 pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-red-600">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">Delete Account</p>
                <p className="text-xs text-gray-500">
                  Permanently deactivate your laundry project account.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
