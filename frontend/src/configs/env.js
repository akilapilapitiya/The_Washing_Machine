// Vite exposes env variables via import.meta.env
// Variables must be prefixed with VITE_ to be exposed to the client

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const IMAGE_BASE_URL = API_BASE_URL.replace("/api", "");
export const NODE_ENV = import.meta.env.MODE || "development";
export const IS_DEV = NODE_ENV === "development";
export const IS_PROD = NODE_ENV === "production";
