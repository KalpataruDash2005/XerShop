import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { User, Shop, Order, ApiResponse } from '@/src/types/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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
      async (config) => {
        const token = await this.getToken();
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
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('accessToken');
    } catch {
      return null;
    }
  }

  private async clearToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    } catch {}
  }

  async setToken(accessToken: string, refreshToken?: string): Promise<void> {
    await SecureStore.setItemAsync('accessToken', accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync('refreshToken', refreshToken);
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

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const api = new ApiClient();

// Auth API
export const authApi = {
  register: (data: { name: string; email?: string; phone: string; password: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>('/auth/register', data),

  login: (data: { identifier: string; password: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>('/auth/login', data),

  sendOtp: (data: { phone: string }) =>
    api.post<ApiResponse<void>>('/auth/otp/send', data),

  verifyOtp: (data: { phone: string; otp: string }) =>
    api.post<ApiResponse<{ verified: boolean }>>('/auth/otp/verify', data),
};

// Shop API
export const shopApi = {
  getNearby: (lat: number, lng: number, radius = 10) =>
    api.get<ApiResponse<Shop[]>>(`/shops/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),

  getById: (id: string) =>
    api.get<ApiResponse<Shop>>(`/shops/${id}`),

  getDetails: (id: string) =>
    api.get<ApiResponse<Shop & { printers: Printer[]; pricingRules: PricingRule[] }>>(`/shops/${id}/details`),
};

// Order API
export const orderApi = {
  getPriceEstimate: (data: { shopId: number; items: any[] }) =>
    api.post<ApiResponse<{ totalAmount: number }>>('/orders/price-estimate', data),

  create: (data: any) =>
    api.post<ApiResponse<Order>>('/orders', data),

  getMyOrders: (page = 0) =>
    api.get<ApiResponse<{ content: Order[]; totalElements: number }>>(`/orders?page=${page}`),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`),
};

// Types
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
