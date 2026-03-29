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
import {
  Loader2,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const handleLocationSelect = (locObj) => {
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: "" }));
    }
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
    if (errors[e.target.id]) {
      setErrors((prev) => ({ ...prev, [e.target.id]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Mobile number must be exactly 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dob = "Date of Birth cannot be in the future";
      }
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = "Please select a valid home location from the map";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

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
            <img
              src={logo}
              alt="The Washing Machine"
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
            Create an Account
          </h1>
          <p className="text-gray-500 text-sm">
            Join The Washing Machine today
          </p>
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
                    <Label htmlFor="title" className="flex items-center gap-1">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      disabled={loading}
                      className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${errors.title ? "border-red-500" : "border-gray-300"}`}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.75rem center",
                        backgroundSize: "1rem",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="">Select Title</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Ven.">Ven.</option>
                      <option value="Rev.">Rev.</option>
                    </select>
                    {errors.title && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={14} />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="flex items-center gap-1"
                      >
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={loading}
                        className={
                          errors.firstName
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle size={14} />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="flex items-center gap-1"
                      >
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={loading}
                        className={
                          errors.lastName
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle size={14} />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className={
                        errors.email
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={14} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="07XXXXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      className={
                        errors.phone
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={14} />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="flex items-center gap-1"
                      >
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={loading}
                          className={`pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle size={14} />
                          {errors.password}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="flex items-center gap-1"
                      >
                        Confirm <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={loading}
                          className={`pr-10 ${
                            formData.confirmPassword &&
                            formData.password !== formData.confirmPassword
                              ? "border-red-500 focus-visible:ring-red-500"
                              : formData.confirmPassword &&
                                  formData.password === formData.confirmPassword
                                ? "border-green-500 focus-visible:ring-green-500"
                                : errors.confirmPassword
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {formData.confirmPassword &&
                        formData.password !== formData.confirmPassword && (
                          <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                            <AlertCircle size={14} />
                            Passwords do not match
                          </p>
                        )}
                      {formData.confirmPassword &&
                        formData.password === formData.confirmPassword && (
                          <p className="text-sm text-green-600 flex items-center gap-1 mt-1 font-medium">
                            <CheckCircle size={14} />
                            Passwords match
                          </p>
                        )}
                      {errors.confirmPassword && !formData.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle size={14} />
                          {errors.confirmPassword}
                        </p>
                      )}
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
                    <Label className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={16} className="text-red-500" />
                        Home Location <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <div
                      className={`rounded-xl overflow-hidden shadow-inner border ${errors.location ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}
                    >
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
                    {errors.location && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={14} />
                        {errors.location}
                      </p>
                    )}
                    {formData.latitude &&
                      formData.distance &&
                      !errors.location && (
                        <p className="text-xs text-green-600 font-medium mt-2">
                          Location selected ({formData.distance.toFixed(1)} km
                          from HQ).
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1 order-2 sm:order-1">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                      Log in
                    </Link>
                  </p>
                  <p className="text-sm text-gray-600">
                    Employee?{" "}
                    <Link
                      to="/employee-login"
                      className="text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
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
