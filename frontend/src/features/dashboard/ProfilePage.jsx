import React, { useState } from "react";
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

// Mock user data - replace with actual user from auth context/API
const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  mobile: "+94 77 123 4567",
  role: "Customer", // or 'Employee'
  joinDate: "January 2024",
  accountType: "Premium", // for customers
  // employeeId: 'EMP-001', // for employees
  // department: 'Detailing', // for employees
};

const ProfilePage = () => {
  const [user, setUser] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    mobile: user.mobile,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate mobile number format (basic validation)
    if (formData.mobile && !formData.mobile.match(/^[+]?[\d\s()-]+$/)) {
      alert("Please enter a valid mobile number");
      return;
    }

    // Update user profile
    setUser({ ...user, name: formData.name, mobile: formData.mobile });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // TODO: API call to update profile
  };

  const handleCancel = () => {
    setFormData({ name: user.name, mobile: user.mobile });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
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
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle size={20} className="text-blue-600" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <User size={48} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <span className="mt-3 px-4 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {user.role}
                </span>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-gray-500" />
                  <div>
                    <p className="text-gray-500">Joined</p>
                    <p className="font-medium">{user.joinDate}</p>
                  </div>
                </div>
                {user.accountType && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase size={16} className="text-gray-500" />
                    <div>
                      <p className="text-gray-500">Account Type</p>
                      <p className="font-medium">{user.accountType}</p>
                    </div>
                  </div>
                )}
                {user.employeeId && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase size={16} className="text-gray-500" />
                    <div>
                      <p className="text-gray-500">Employee ID</p>
                      <p className="font-medium">{user.employeeId}</p>
                    </div>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase size={16} className="text-gray-500" />
                    <div>
                      <p className="text-gray-500">Department</p>
                      <p className="font-medium">{user.department}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Profile Information
                </CardTitle>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-500 text-sm">Full Name</Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User size={18} className="text-gray-500" />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500 text-sm">
                        Mobile Number
                      </Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone size={18} className="text-gray-500" />
                        <span className="font-medium">{user.mobile}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500 text-sm">
                      Email Address
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail size={18} className="text-gray-500" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email address cannot be changed
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="+94 77 123 4567"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500 text-sm">
                      Email Address
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border border-gray-300">
                      <Mail size={18} className="text-gray-400" />
                      <span className="text-gray-500">{user.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email address cannot be changed
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                    <Button type="submit" className="flex items-center gap-2">
                      <CheckCircle size={16} />
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Password</h4>
                <p className="text-sm text-gray-600">
                  Last changed 2 months ago
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  (window.location.href = "/dashboard/change-password")
                }
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
