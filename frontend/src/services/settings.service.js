import api from "@/lib/api";

export const getPricingRules = async () => {
  const response = await api.get("/settings/pricing");
  return response.data;
};

export const updatePricingRules = async (rules) => {
  const response = await api.put("/settings/pricing", rules);
  return response.data;
};
