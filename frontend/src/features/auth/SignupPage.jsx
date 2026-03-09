import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { signUp } from "@/services/auth.service";
import { Loader2, MapPin } from "lucide-react";
import LocationPicker from "@/components/common/LocationPicker";
import logo from "@/assets/logo.svg";

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",
    dob: "",
    latitude: "6.9271",
    longitude: "79.8612",
    password: "",
    confirmPassword: "",
    distance: null, // to track if within delivery radius
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLocationSelect = (locObj) => {
    if (!locObj) {
      setFormData((prev) => ({
        ...prev,
        latitude: null,
        longitude: null,
        distance: null,
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      latitude: locObj.lat.toString(),
      longitude: locObj.lng.toString(),
      distance: locObj.distance,
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Validate Date of Birth if provided (ensure it's not in the future)
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (birthDate > today) {
        setError("Date of Birth cannot be in the future.");
        setLoading(false);
        return;
      }
    }

    if (!formData.latitude || !formData.longitude) {
      setError("Please select a valid home location from the map within our service area.");
      return;
    }

    setLoading(true);

    try {
      // Call signup API
      const response = await signUp({
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        telephone: formData.phone,
        nic: formData.nic || null,
        dob: formData.dob || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        profile_picture_url: "default_profile_pic_url",
      });

      // Check if signup was successful
      if (response.success && response.data) {
        const { customer, token } = response.data;

        // Update auth context with customer type
        login(customer, token, "customer");

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(response.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);

      // Handle different error types
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An error occurred during signup. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={logo} alt="The Washing Machine" className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Create an Account</h1>
          <p className="text-gray-500 text-sm">Join The Washing Machine today</p>
        </div>

        <Card className="shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Complete your profile to access laundry services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Personal Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <select
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1rem", paddingRight: "2.5rem" }}
                    >
                      <option value="">Select Title</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Ven.">Ven.</option>
                      <option value="Rev.">Rev.</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="07XXXXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Address & Identity */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nic">NIC (Optional)</Label>
                      <Input
                        id="nic"
                        value={formData.nic}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={formData.dob}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin size={16} className="text-red-500" />
                      Home Location (Required)
                    </Label>
                    <div className="rounded-xl overflow-hidden shadow-inner border border-slate-200">
                      <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        initialLocation={
                          formData.latitude && formData.longitude
                            ? {
                              lat: parseFloat(formData.latitude),
                              lng: parseFloat(formData.longitude),
                            }
                            : undefined
                        }
                      />
                    </div>
                    {formData.latitude && formData.distance && (
                      <p className="text-xs text-green-600 font-medium mt-2">
                        Location selected ({formData.distance.toFixed(1)} km from HQ).
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1 order-2 sm:order-1">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-red-600 hover:text-red-700 font-medium hover:underline">
                      Log in
                    </Link>
                  </p>
                  <p className="text-sm text-gray-600">
                    Employee?{" "}
                    <Link to="/employee-login" className="text-red-600 hover:text-red-700 font-medium hover:underline">
                      Employee portal →
                    </Link>
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto px-10 h-10 bg-primary hover:bg-red-700 text-white font-semibold transition-colors order-1 sm:order-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
