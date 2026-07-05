import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    try {
      const authData = localStorage.getItem('printhub-admin-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || null;
      }
    } catch (e) {
      console.error(e);
    }
    return localStorage.getItem('adminToken');
  }

  private clearToken(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('printhub-admin-auth');
  }

  setToken(token: string): void {
    localStorage.setItem('adminToken', token);
    try {
      const authData = localStorage.getItem('printhub-admin-auth');
      const parsed = authData ? JSON.parse(authData) : { state: {} };
      parsed.state.token = token;
      localStorage.setItem('printhub-admin-auth', JSON.stringify(parsed));
    } catch (e) {
      console.error(e);
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const api = new ApiClient();

// Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Auth API
export const authApi = {
  login: (data: { identifier: string; password: string }) =>
    api.post<ApiResponse<{ accessToken: string; user: AdminUser }>>('/auth/login', data),
};

// Admin API
export const adminApi = {
  getDashboardStats: () =>
    api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats'),

  getRevenueChart: (period: string) =>
    api.get<ApiResponse<ChartData[]>>(`/admin/dashboard/revenue?period=${period}`),

  getRecentOrders: (limit = 10) =>
    api.get<ApiResponse<Order[]>>(`/admin/dashboard/recent-orders?limit=${limit}`),

  getPendingApprovals: () =>
    api.get<ApiResponse<Shop[]>>('/admin/pending-approvals'),

  approveShop: (id: number) =>
    api.patch<ApiResponse<Shop>>(`/admin/shops/${id}/approve`),

  rejectShop: (id: number, reason: string) =>
    api.patch<ApiResponse<Shop>>(`/admin/shops/${id}/reject`, { reason }),
};

// Users API
export const usersApi = {
  getAll: (page = 0, size = 20, search?: string) =>
    api.get<ApiResponse<PagedResponse<User>>>(`/users?page=${page}&size=${size}${search ? `&search=${search}` : ''}`),

  getById: (id: number) =>
    api.get<ApiResponse<User>>(`/users/${id}`),

  updateRole: (id: number, role: string) =>
    api.patch<ApiResponse<User>>(`/users/${id}/role`, { role }),

  toggleStatus: (id: number) =>
    api.patch<ApiResponse<User>>(`/users/${id}/toggle-status`),
};

// Shops API
export const shopsApi = {
  getAll: (page = 0, size = 20, status?: string) =>
    api.get<ApiResponse<PagedResponse<Shop>>>(`/shops?page=${page}&size=${size}${status ? `&status=${status}` : ''}`),

  getById: (id: number) =>
    api.get<ApiResponse<ShopDetails>>(`/shops/${id}/details`),

  updateStatus: (id: number, status: string) =>
    api.patch<ApiResponse<Shop>>(`/shops/${id}/status`, { status }),
};

// Orders API
export const ordersApi = {
  getAll: (page = 0, size = 20, status?: string) =>
    api.get<ApiResponse<PagedResponse<Order>>>(`/orders?page=${page}&size=${size}${status ? `&status=${status}` : ''}`),

  getById: (id: number) =>
    api.get<ApiResponse<OrderDetails>>(`/orders/${id}`),
};

// Types
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isVerified: boolean;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  phone: string;
  role: string;
  isVerified: boolean;
  walletBalance: number;
  totalOrders: number;
  createdAt: string;
}

export interface Shop {
  id: number;
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  ratingAvg: number;
  totalReviews: number;
  totalOrders: number;
  totalRevenue: number;
  isAcceptingOrders: boolean;
  createdAt: string;
}

export interface ShopDetails extends Shop {
  printers: Printer[];
  pricingRules: PricingRule[];
  recentOrders: Order[];
}

export interface Printer {
  id: number;
  name: string;
  type: string;
  status: string;
}

export interface PricingRule {
  id: number;
  paperSize: string;
  colorMode: string;
  basePrice: number;
  pricePerPage: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  userPhone: string;
  shopId: number;
  shopName: string;
  status: string;
  deliveryType: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderDetails extends Order {
  items: OrderItem[];
  timeline: OrderTimeline[];
  address?: Address;
}

export interface OrderItem {
  id: number;
  fileName: string;
  pageCount: number;
  copies: number;
  colorMode: string;
  sides: string;
  paperSize: string;
  binding?: string;
  lineTotal: number;
}

export interface OrderTimeline {
  id: number;
  status: string;
  notes?: string;
  changedByName?: string;
  createdAt: string;
}

export interface Address {
  id: number;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalShops: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeOrders: number;
  todayOrders: number;
  todayRevenue: number;
  monthlyGrowth: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}
