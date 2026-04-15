import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  ArrowLeft,
  User,
  Phone,
  Briefcase,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import advertisementService from "../../services/advertisement.service";

const PostAdPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    client_contact: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim())
      newErrors.title = "Business name or ad title is required";
    if (!formData.client_name.trim())
      newErrors.client_name = "Contact name is required";
    if (!formData.client_contact.trim()) {
      newErrors.client_contact = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.client_contact.trim())) {
      newErrors.client_contact = "Please enter a valid 10-digit phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await advertisementService.requestAd(formData);
      setSubmitted(true);
      toast.success("Advertisement request submitted successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl overflow-hidden rounded-3xl animate-in zoom-in-95 duration-500">
          <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-400" />
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2
                size={40}
                className="animate-in slide-in-from-bottom-2 duration-700"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Request Received!
              </h2>
              <p className="text-gray-500 font-medium">
                Our marketing team will review your details and contact you
                within 24 hours to proceed with your advertisement.
              </p>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => navigate("/")}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all hover:scale-[1.02]"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
        {/* Left Side: Marketing Copy */}
        <div className="lg:w-1/2 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-widest border border-red-100">
              <Zap size={12} className="fill-current" />
              Grow Your Business
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">
              Reach Thousands <br />
              Of <span className="text-red-600">Local Customers.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">
              Showcase your business to our high-traffic customer base. Submit
              your interest below and join our premium partner network.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: ShieldCheck,
                title: "Premium Placement",
                desc: "Top-tier slots on our homepage carousel.",
              },
              {
                icon: Briefcase,
                title: "Expert Support",
                desc: "Our team helps you design the perfect banner.",
              },
              {
                icon: Megaphone,
                title: "High Conversion",
                desc: "Targeted local traffic ready to engage.",
              },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-red-600">
                  <feature.icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:w-1/2 w-full animate-in fade-in slide-in-from-right-8 duration-700">
          <Card className="border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black tracking-tight text-gray-900">
                Post Your Ad
              </CardTitle>
              <CardDescription className="text-gray-500 font-medium pt-1">
                Provide your details and we'll handle the rest.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"
                  >
                    <Megaphone size={12} />
                    Ad/Business Title
                  </Label>
                  <div className="relative">
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Acme Car Detailing"
                      className={`h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-red-600 rounded-2xl px-5 text-gray-900 font-semibold transition-all ${errors.title ? "border-red-500 ring-1 ring-red-500 bg-red-50/30" : ""}`}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-[10px] text-red-500 font-bold uppercase pl-1">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="client_name"
                      className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"
                    >
                      <User size={12} />
                      Full Name
                    </Label>
                    <Input
                      id="client_name"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-red-600 rounded-2xl px-5 text-gray-900 font-semibold transition-all ${errors.client_name ? "border-red-500 ring-1 ring-red-500 bg-red-50/30" : ""}`}
                    />
                    {errors.client_name && (
                      <p className="text-[10px] text-red-500 font-bold uppercase pl-1">
                        {errors.client_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="client_contact"
                      className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"
                    >
                      <Phone size={12} />
                      Phone Number
                    </Label>
                    <Input
                      id="client_contact"
                      name="client_contact"
                      value={formData.client_contact}
                      onChange={handleInputChange}
                      placeholder="07xxxxxxxx"
                      className={`h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-red-600 rounded-2xl px-5 text-gray-900 font-semibold transition-all ${errors.client_contact ? "border-red-500 ring-1 ring-red-500 bg-red-50/30" : ""}`}
                    />
                    {errors.client_contact && (
                      <p className="text-[10px] text-red-500 font-bold uppercase pl-1">
                        {errors.client_contact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex flex-col gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-red-200 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Submit Request"
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-xs uppercase tracking-widest transition-colors py-2"
                  >
                    <ArrowLeft size={14} />
                    Go Back
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostAdPage;
