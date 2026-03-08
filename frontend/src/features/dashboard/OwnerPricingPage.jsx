import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Calculator, Route } from "lucide-react";
import * as settingsService from "@/services/settings.service";

const OwnerPricingPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testDistance, setTestDistance] = useState(1);
  const [calculatedCost, setCalculatedCost] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      base_km: 5,
      base_fee: 500,
      additional_rate: 100,
      buffer_minutes: 30,
    },
  });

  const formValues = watch();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!loading) {
      calculateTestCost();
    }
  }, [testDistance, formValues]);

  const fetchSettings = async () => {
    try {
      const rules = await settingsService.getPricingRules();
      setValue("base_km", rules.base_km);
      setValue("base_fee", rules.base_fee);
      setValue("additional_rate", rules.additional_rate);
      setValue("buffer_minutes", rules.buffer_minutes || 30);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Could not load pricing rules.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await settingsService.updatePricingRules(data);
      toast.success("Pricing rules updated successfully!");
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const calculateTestCost = () => {
    const dist = parseFloat(testDistance) || 0;
    const baseKm = parseFloat(formValues.base_km) || 0;
    const baseFee = parseFloat(formValues.base_fee) || 0;
    const rate = parseFloat(formValues.additional_rate) || 0;

    let cost = 0;
    if (dist <= baseKm) {
      cost = baseFee;
    } else {
      const extra = dist - baseKm;
      cost = baseFee + extra * rate;
    }
    setCalculatedCost(cost.toFixed(2));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Travel Pricing Configuration
        </h1>
        <p className="text-gray-500 mt-2">
          Manage how travel costs are calculated for Home Visits.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pricing Rules
              </CardTitle>
              <CardDescription>
                Set the base fee and rates for additional distance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="base_km">Base Distance (km)</Label>
                  <p className="text-xs text-gray-500">
                    The initial distance covered by the base fee.
                  </p>
                  <Input
                    id="base_km"
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("base_km", {
                      required: "Required",
                      min: 0,
                      valueAsNumber: true,
                    })}
                  />
                  {errors.base_km && (
                    <span className="text-xs text-red-500">
                      {errors.base_km.message}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_fee">Base Fee (LKR)</Label>
                  <p className="text-xs text-gray-500">
                    Fixed cost for travel within the base distance.
                  </p>
                  <Input
                    id="base_fee"
                    type="number"
                    min="0"
                    {...register("base_fee", {
                      required: "Required",
                      min: 0,
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_rate">
                    Additional Rate (LKR/km)
                  </Label>
                  <p className="text-xs text-gray-500">
                    Cost per km for distance beyond the base distance.
                  </p>
                  <Input
                    id="additional_rate"
                    type="number"
                    min="0"
                    {...register("additional_rate", {
                      required: "Required",
                      min: 0,
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buffer_minutes">Buffer Time (minutes)</Label>
                  <p className="text-xs text-gray-500">
                    Extra time added to booking duration for traffic/rest.
                  </p>
                  <Input
                    id="buffer_minutes"
                    type="number"
                    min="0"
                    {...register("buffer_minutes", {
                      required: "Required",
                      min: 0,
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <Separator className="my-4" />

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Configuration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-50/50 border-dashed border-2 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Cost Simulator
              </CardTitle>
              <CardDescription>
                Test your pricing rules instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="test_dist">Test Distance (km)</Label>
                <div className="relative">
                  <Input
                    id="test_dist"
                    type="number"
                    min="0"
                    step="0.1"
                    value={testDistance}
                    onChange={(e) => setTestDistance(e.target.value)}
                    className="pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Route className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Calculated Travel Cost
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {calculatedCost}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">
                    LKR
                  </span>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <span>{parseFloat(testDistance).toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Tier:</span>
                    <span>
                      {Math.min(testDistance, formValues.base_km || 0)} km @{" "}
                      {formValues.base_fee} LKR
                    </span>
                  </div>
                  {testDistance > (formValues.base_km || 0) && (
                    <div className="flex justify-between text-blue-600 font-medium">
                      <span>Extra Tier:</span>
                      <span>
                        {(testDistance - (formValues.base_km || 0)).toFixed(1)}{" "}
                        km x {formValues.additional_rate} LKR
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>
                  Cost is fixed at the Base Fee for any distance up to the Base
                  Distance.
                </li>
                <li>
                  Any distance exceeding the Base Distance is charged at the
                  Additional Rate per km.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerPricingPage;
