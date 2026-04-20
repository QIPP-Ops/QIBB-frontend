import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor for JWT token
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const kpiApi = {
  getLatest: (params?: { days?: number, startDate?: string, endDate?: string }) => api.get("/kpis", { params }),
};

export const rosterApi = {
  getEmployees: () => api.get("/roster"),
  createEmployee: (data: any) => api.post("/roster", data),
  updateEmployee: (empId: string, data: any) => api.put(`/roster/${empId}`, data),
  deleteEmployee: (empId: string) => api.delete(`/roster/${empId}`),
  addLeave: (employeeId: string, leave: any) => api.post("/roster/leave", { employeeId, leave }),
  deleteLeave: (empId: string, leaveId: string) => api.delete(`/roster/leave/${empId}/${leaveId}`),
};

export const adminApi = {
  getStatus: () => api.get("/admin/status"),
  checkPin: (pin: string) => api.post("/admin/check-pin", { pin }),
  setLock: (locked: boolean) => api.post("/admin/set-lock", { locked }),
  login: (credentials: any) => api.post("/auth/login", credentials),
  register: (credentials: any) => api.post("/auth/register", credentials),
};

export const safetyApi = {
  getPermits: () => api.get("/safety"),
  createPermit: (data: any) => api.post("/safety", data),
  updatePermit: (id: string, data: any) => api.patch(`/safety/${id}`, data),
  deletePermit: (id: string) => api.delete(`/safety/${id}`),
};
