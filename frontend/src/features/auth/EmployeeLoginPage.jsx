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
import { employeeSignIn } from "@/services/auth.service";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.svg";

const EmployeeLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await employeeSignIn({
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.data) {
        const { employee, token } = response.data;
        login(employee, token, "employee");
        navigate("/dashboard");
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Employee login error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={logo} alt="The Washing Machine" className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Employee Portal</h1>
          <p className="text-gray-500 text-sm">Sign in to your employee account</p>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Employee Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the employee portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@washingmachine.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1.5">
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-red-600"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  state={{ userType: "employee" }}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <p className="text-center text-sm text-gray-500">
                Not an employee?{" "}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-medium hover:underline">
                  Customer sign in
                </Link>
              </p>
              <p className="text-center text-sm text-gray-500">
                New employee?{" "}
                <Link to="/signup" className="text-red-600 hover:text-red-700 font-medium hover:underline">
                  Create an account →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;
