import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const userId = window.localStorage.getItem("pulsepoint-user-id");

  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  return config;
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { error?: { message?: string } })?.error?.message ??
      error.message
    );
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}
