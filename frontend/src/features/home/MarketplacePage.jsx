import React, { useState } from "react";
import {
  Loader2,
  ArrowRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import advertisementService from "../../services/advertisement.service";
import Footer from "../home/Footer";

const MarketplacePage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    client_contact: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Business name is required";
    if (!formData.client_name.trim())
      newErrors.client_name = "Name is required";
    if (
      !formData.client_contact.trim() ||
      !/^[0-9]{10}$/.test(formData.client_contact)
    ) {
      newErrors.client_contact = "Valid 10-digit number required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await advertisementService.requestAd(formData);
      toast.success("Request Submitted!", {
        description: `We've received your application for ${formData.title}. Our team will contact you directly via ${formData.client_contact} within 24 hours.`,
      });
      setFormData({ title: "", client_name: "", client_contact: "" });
    } catch (error) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pt-12 lg:pt-20">
      
      {/* Public Header */}
      <div className="text-center flex flex-col items-center mb-16 px-4">
        <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
          Partner With Us
        </h2>
        <p className="text-lg lg:text-xl text-gray-500 max-w-2xl text-center font-medium">
          Showcase your automotive brand to thousands of local vehicle owners. 
          Fill out the form below to start your advertisement request.
        </p>
      </div>

      {/* Submission Form Area */}
      <div className="flex-1 flex flex-col items-center px-4 mb-24">
        <div id="post-ad-form" className="max-w-4xl mx-auto w-full">
          <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-gray-50">
            <div className="grid md:grid-cols-2">
              <div className="bg-gray-900 p-10 lg:p-14 text-white flex flex-col justify-center space-y-8">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                    Grow Your Business
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-black leading-tight">
                    Premium Ad Placements
                  </h2>
                </div>
                <p className="text-gray-400 text-base leading-relaxed font-medium">
                  We collaborate with mechanics, retailers, and auto-experts to 
                  bring the best value to our customers. Once you submit, our 
                  marketing team will personally reach out to finalize your banner design.
                </p>
              </div>

              <CardContent className="p-10 lg:p-14 bg-white flex flex-col justify-center">
                <div className="mb-8 border-l-4 border-red-600 pl-6">
                  <h3 className="text-2xl font-black text-gray-900 italic">
                    Application Details
                  </h3>
                  <p className="text-gray-400 text-xs font-bold uppercase mt-1">
                    Complete all required fields
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-gray-500 uppercase tracking-tighter">
                      Business Entity Name
                    </Label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Acme Auto Care"
                      className={`h-12 rounded-xl border-gray-100 bg-gray-50/50 px-5 text-gray-900 font-bold focus:ring-red-500 transition-all ${errors.title ? "border-red-500 bg-red-50/20" : ""}`}
                    />
                    {errors.title && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter ml-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-gray-500 uppercase tracking-tighter">
                      Primary Contact Person
                    </Label>
                    <Input
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      placeholder="Your Full Name"
                      className={`h-12 rounded-xl border-gray-100 bg-gray-50/50 px-5 text-gray-900 font-bold focus:ring-red-500 transition-all ${errors.client_name ? "border-red-500 bg-red-50/20" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-gray-500 uppercase tracking-tighter">
                      Direct Phone Number
                    </Label>
                    <Input
                      name="client_contact"
                      value={formData.client_contact}
                      onChange={handleInputChange}
                      placeholder="07XXXXXXXX"
                      className={`h-12 rounded-xl border-gray-100 bg-gray-50/50 px-5 text-gray-900 font-bold focus:ring-red-500 transition-all ${errors.client_contact ? "border-red-500 bg-red-50/20" : ""}`}
                    />
                    {errors.client_contact && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter ml-1">
                        {errors.client_contact}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl shadow-red-100 transition-all mt-6 rounded-2xl"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>Submit Interest</span>
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </Button>
                  
                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Our team will contact you directly via phone within 24 hours.
                  </p>
                </form>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>

      <Footer id="contact" />
    </div>
  );
};

export default MarketplacePage;
