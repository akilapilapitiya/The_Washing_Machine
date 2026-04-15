import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
import {
  requestCustomerPasswordReset,
  resetCustomerPassword,
  requestEmployeePasswordReset,
  resetEmployeePassword,
} from "@/services/auth.service";
import logo from "@/assets/logo.svg";
import {
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Home,
} from "lucide-react";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine user type from URL or previous page
  const [userType, setUserType] = useState(
    location.state?.userType || "customer",
  );
  const [step, setStep] = useState(userType ? 1 : 0); // 0: type selection, 1: email, 2: otp, 3: password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep(1);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    setLoading(true);

    try {
      const requestFn =
        userType === "customer"
          ? requestCustomerPasswordReset
          : requestEmployeePasswordReset;

      const response = await requestFn(email);

      if (response.success) {
        setStep(2);
      } else {
        setError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("Request OTP error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    if (otp.length === 6) {
      setStep(3);
    } else {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const newErrors = {};

    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const resetFn =
        userType === "customer" ? resetCustomerPassword : resetEmployeePassword;

      const response = await resetFn({
        email,
        otp,
        newPassword: password,
      });

      if (response.success) {
        // Navigate to appropriate login page
        const loginPath =
          userType === "customer" ? "/login" : "/employee-login";
        navigate(loginPath, {
          state: {
            message:
              "Password reset successful! Please login with your new password.",
          },
        });
      } else {
        setError(
          response.message || "Failed to reset password. Please try again.",
        );
      }
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    } else if (step === 1 && !location.state?.userType) {
      setStep(0);
      setUserType(null);
    } else {
      const loginPath = userType === "customer" ? "/login" : "/employee-login";
      navigate(loginPath);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden bg-gray-50">
      {/* Background Watermark Logo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none flex items-center justify-center opacity-[0.15] mix-blend-multiply transition-opacity duration-1000">
        <img
          src={logo}
          alt=""
          className="w-[600px] lg:w-[1000px] h-auto object-contain grayscale"
        />
      </div>

      {/* Back to Home Navigation */}
      <Link
        to="/"
        className="fixed top-8 left-8 hidden md:flex items-center gap-3 text-gray-400 hover:text-red-600 transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] group"
      >
        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-red-600 group-hover:shadow-lg transition-all">
          <Home size={16} className="transition-transform" />
        </div>
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-2 uppercase">
            Reset Password
          </h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-red-700 font-bold uppercase tracking-widest text-[10px] transition-colors"
          >
            <ArrowLeft size={14} />
            {step === 0 ? "Back to Login" : "Back"}
          </button>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-lg">Account Recovery</CardTitle>
            <CardDescription>
              {step === 0 && "Select your account type"}
              {step === 1 && "Enter your email to get started"}
              {step === 2 && "Enter the verification code sent to your email"}
              {step === 3 && "Create your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            {/* Step 0: User Type Selection */}
            {step === 0 && (
              <div className="space-y-3">
                <Button
                  onClick={() => handleUserTypeSelect("customer")}
                  className="w-full"
                  variant="outline"
                >
                  Customer Account
                </Button>
                <Button
                  onClick={() => handleUserTypeSelect("employee")}
                  className="w-full"
                  variant="outline"
                >
                  Employee Account
                </Button>
              </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
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
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    A 6-digit verification code will be sent to your email
                    address.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="flex items-center gap-1">
                    One-Time Password (OTP){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      if (errors.otp) setErrors({ ...errors, otp: "" });
                    }}
                    maxLength="6"
                    disabled={loading}
                    className={
                      errors.otp
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      {errors.otp}
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    Please check your email for the 6-digit verification code.
                    The code expires in 10 minutes and can be used up to 3
                    times.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="new-password"
                    className="flex items-center gap-1"
                  >
                    New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors({ ...errors, password: "" });
                      }}
                      disabled={loading}
                      className={`pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                    htmlFor="confirm-password"
                    className="flex items-center gap-1"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword)
                          setErrors({ ...errors, confirmPassword: "" });
                      }}
                      disabled={loading}
                      className={`pr-10 ${
                        confirmPassword && password !== confirmPassword
                          ? "border-red-500 focus-visible:ring-red-500"
                          : confirmPassword && password === confirmPassword
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
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle size={14} />
                      Passwords match
                    </p>
                  )}
                  {errors.confirmPassword && !confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    password.length < 8
                  }
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        {step > 0 && (
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-2 rounded-full transition-colors ${
                  s <= step ? "bg-red-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
