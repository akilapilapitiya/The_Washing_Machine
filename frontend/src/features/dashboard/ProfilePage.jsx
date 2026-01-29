import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user, updateUser, userType } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
  });
  React.useEffect(() => {
    setFormData({
      name: user?.name || "",
      mobile: user?.mobile || "",
    });
  }, [user]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate mobile number format (basic validation)
    if (formData.mobile && !formData.mobile.match(/^[+]?[\d\s()-]+$/)) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    // Update user profile in context (and localStorage)
    updateUser({ name: formData.name, mobile: formData.mobile });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    // TODO: API call to update profile in backend
  };

  const handleCancel = () => {
    setFormData({ name: user.name, mobile: user.mobile });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Account Settings
          </p>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">
            View and manage your account information.
          </p>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">
              Profile updated successfully!
            </p>
          </div>
        )}

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
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-200">
                  <User size={48} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="mt-3 px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest border border-red-100 rounded-full">
                  {userType === "employee" ? "Employee" : "Customer"}
                </span>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Joined
                    </p>
                    <p className="font-semibold text-gray-700">
                      {user.joinDate}
                    </p>
                  </div>
                </div>
                {user?.accountType && userType === "customer" && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        Account Type
                      </p>
                      <p className="font-semibold text-gray-700">
                        {user.accountType}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  <User size={18} className="text-red-600" />
                  Basic Information
                </CardTitle>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase text-gray-400">
                        Full Name
                      </Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <User size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          {user?.name}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase text-gray-400">
                        Mobile Number
                      </Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <Phone size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          {user?.mobile}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase text-gray-400">
                      Email Address
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                      <Mail size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-700">
                        {user?.email}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 italic font-medium">
                      Note: Email address is used for authentication and cannot
                      be modified.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="focus:ring-red-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="text-sm font-medium">
                        Mobile Number
                      </Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="+94 77 123 4567"
                        className="focus:ring-red-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="h-10 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="h-10 text-sm bg-red-600 hover:bg-red-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Security */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border text-gray-400">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-700">Login Password</h4>
                  <p className="text-xs text-gray-500">
                    Maintain a strong password to secure your mission-critical
                    data.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="font-bold border-gray-300"
                onClick={() =>
                  (window.location.href = "/dashboard/change-password")
                }
              >
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
