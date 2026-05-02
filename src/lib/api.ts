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
  getConfig: () => api.get("/admin/config"),
  checkPin: (pin: string) => api.post("/admin/check-pin", { pin }),
  setLock: (locked: boolean) => api.post("/admin/set-lock", { locked }),
  login: (credentials: any) => api.post("/auth/login", credentials),
  register: (credentials: any) => api.post("/auth/register", credentials),
  
  // Metadata Management
  addCrew: (crew: string) => api.post("/admin/crews", { crew }),
  removeCrew: (crew: string) => api.delete(`/admin/crews/${crew}`),
  addRole: (role: string) => api.post("/admin/roles", { role }),
  removeRole: (role: string) => api.delete(`/admin/roles/${role}`),

  // User Management
  getAllUsers: () => api.get("/admin/users"),
  getPendingUsers: () => api.get("/admin/users/pending"),
  approveUser: (id: string) => api.put(`/admin/users/${id}/approve`),
  rejectUser: (id: string) => api.delete(`/admin/users/${id}/reject`),
  updateUserRole: (id: string, accessRole: string) => api.put(`/admin/users/${id}/role`, { accessRole }),
};

export const safetyApi = {
  getDashboard: () => api.get("/safety/dashboard"),
  getPermits: () => api.get("/safety/permits"),
  getJhas: () => api.get("/safety/jhas"),
  getWorkOrders: (type?: string) => api.get("/safety/work-orders", { params: { type } }),
  getLotoSafes: () => api.get("/safety/loto-safes"),
  getIsolationPoints: () => api.get("/safety/isolation-points"),
  createPermit: (data: any) => api.post("/safety", data),
  updatePermit: (id: string, data: any) => api.patch(`/safety/${id}`, data),
  deletePermit: (id: string) => api.delete(`/safety/${id}`),
};

export const roReportApi = {
  getAll: () => api.get("/ro-reports"),
  getLatest: () => api.get("/ro-reports/latest"),
  getById: (id: string) => api.get(`/ro-reports/${id}`),
};
