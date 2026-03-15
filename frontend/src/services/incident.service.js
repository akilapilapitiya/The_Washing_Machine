import api from "@/lib/api";

const normalizeIncidentList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.incidents)) return payload.data.incidents;
  if (Array.isArray(payload?.incidents)) return payload.incidents;
  return [];
};

export const createIncident = async (data) => {
  const response = await api.post("/incident", data);
  return response.data;
};

export const getIncidents = async () => {
  const response = await api.get("/incident");
  return normalizeIncidentList(response.data);
};

export const updateIncidentStatus = async (id, status) => {
  const response = await api.patch(`/incident/${id}`, { status });
  return response.data;
};
