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
import { ArrowLeft, AlertCircle } from "lucide-react";
import {
  requestCustomerPasswordReset,
  resetCustomerPassword,
  requestEmployeePasswordReset,
  resetEmployeePassword,
} from "@/services/auth.service";
import logo from "@/assets/logo.svg";

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
  const [error, setError] = useState("");

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep(1);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
    if (otp.length === 6) {
      setStep(3);
    } else {
      setError("Please enter a valid 6-digit OTP");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={logo} alt="The Washing Machine" className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Reset Password</h1>
          <p className="text-gray-500 text-sm">We'll send a verification code to your email</p>
        </div>

        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
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
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    A 6-digit verification code will be sent to your email
                    address.
                  </p>
                </div>
                <Button type="submit" className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password (OTP)</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength="6"
                    disabled={loading}
                    required
                  />
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
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <p className="text-sm text-red-600">
                      Passwords do not match
                    </p>
                  )}

                {password && password.length < 8 && (
                  <p className="text-sm text-orange-600">
                    Password must be at least 8 characters
                  </p>
                )}

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
                className={`h-2 w-2 rounded-full transition-colors ${s <= step ? "bg-red-600" : "bg-gray-200"
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
