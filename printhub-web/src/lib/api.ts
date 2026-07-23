import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xershop-production.up.railway.app/api/v1';

// ─── Base Types ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: number;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ─── Domain Types ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email?: string;
  phone: string;
  role: string;
  isVerified: boolean;
  profileImageUrl?: string;
  createdAt: string;
}

export interface Address {
  id: number;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt?: string;
}

export interface Shop {
  id: number;
  ownerId: number;
  ownerName: string;
  name: string;
  description?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  status: string;
  ratingAvg: number;
  totalReviews: number;
  isAcceptingOrders: boolean;
  distanceKm?: number;
}

export interface ShopDetails extends Shop {
  printers: Printer[];
  pricingRules: PricingRule[];
  recentReviews: Review[];
}

export interface Printer {
  id: number;
  name: string;
  model?: string;
  type: string;
  status: string;
  maxPaperSize?: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
}

export interface PricingRule {
  id: number;
  paperSize?: string;
  gsm?: number;
  colorMode?: string;
  sides?: string;
  binding?: string;
  basePrice: number;
  pricePerPage?: number;
  pricePerCopy?: number;
  laminationPrice?: number;
  bindingPrice?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  shopId: number;
  shopName: string;
  status: string;
  deliveryType: string;
  deliveryAddress?: Address;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  totalAmount: number;
  couponCode?: string;
  walletAmountUsed?: number;
  notes?: string;
  rejectionReason?: string;
  estimatedCompletionAt?: string;
  completedAt?: string;
  createdAt: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
  userName?: string;
  userPhone?: string;
  screenshotPath?: string;
  paymentStatus?: string;
}

export interface OrderItem {
  id: number;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  pageCount: number;
  copies: number;
  colorMode: string;
  sides: string;
  paperSize?: string;
  gsm?: number;
  binding?: string;
  lamination: boolean;
  pageRange?: string;
  lineTotal: number;
}

export interface OrderTimeline {
  id: number;
  status: string;
  notes?: string;
  changedByName?: string;
  createdAt: string;
}

export interface PriceEstimateRequest {
  shopId: number;
  items: {
    pageCount: number;
    copies: number;
    colorMode: string;
    sides: string;
    paperSize?: string;
    gsm?: number;
    binding?: string;
    lamination?: boolean;
  }[];
  couponCode?: string;
  walletAmountUsed?: number;
  envelopePackaging?: boolean;
}

export interface PriceEstimateResponse {
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  walletDiscount: number;
  totalAmount: number;
  couponApplied?: string;
  couponDiscount?: number;
  couponMessage?: string;
  itemBreakdowns: {
    pageCount: number;
    copies: number;
    colorMode: string;
    paperSize?: string;
    basePrice: number;
    printingCost: number;
    bindingCost: number;
    laminationCost: number;
    lineTotal: number;
  }[];
}

export interface CreateOrderRequest {
  shopId: number;
  deliveryType: string;
  addressId?: number;
  items: {
    fileUrl?: string;
    fileName: string;
    fileType?: string;
    pageCount: number;
    copies: number;
    colorMode: string;
    sides: string;
    paperSize?: string;
    gsm?: number;
    binding?: string;
    lamination?: boolean;
    pageRange?: string;
  }[];
  couponCode?: string;
  walletAmountUsed?: number;
  notes?: string;
}

export interface Payment {
  id: number;
  orderId: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: string;
  amount: number;
  currency: string;
  method?: string;
  createdAt: string;
  utr?: string;
  screenshotPath?: string;
  userName?: string;
  userPhone?: string;
  contactPhone?: string;
}

export interface UpiPayResponse {
  orderId: number;
  orderNumber: string;
  amount: number;
  upiId: string;
  upiDeepLink: string;
  merchantName: string;
}

export interface Review {
  id: number;
  orderId: number;
  userId: number;
  userName: string;
  rating: number;
  comment?: string;
  images?: string[];
  shopResponse?: string;
  createdAt: string;
}

// ─── HTTP Client ─────────────────────────────────────────────────────────────

class HttpClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const authData = localStorage.getItem('printhub-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.accessToken || null;
      }
    } catch {
      // ignore parse errors
    }
    return localStorage.getItem('accessToken');
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('printhub-auth');
    document.cookie = 'printhub-auth-token=; path=/; max-age=0; SameSite=Lax';
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

const http = new HttpClient();

// ─── Base API Service ────────────────────────────────────────────────────────

abstract class BaseApiService {
  protected abstract get basePath(): string;
}

// ─── API Services ────────────────────────────────────────────────────────────

class AuthApiService extends BaseApiService {
  protected basePath = '/auth';

  register(data: { name: string; email?: string; phone: string; password: string; referralCode?: string }) {
    return http.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>('/auth/register', data);
  }

  login(data: { identifier: string; password: string }) {
    return http.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>('/auth/login', data);
  }

  refreshToken(data: { refreshToken: string }) {
    return http.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', data);
  }

  logout(refreshToken: string) {
    return http.post<ApiResponse<void>>('/auth/logout', { refreshToken });
  }

  forgotPassword(identifier: string) {
    return http.post<ApiResponse<{ message: string; otp: string }>>('/auth/forgot-password', { identifier });
  }

  resetPassword(identifier: string, otp: string, newPassword: string) {
    return http.post<ApiResponse<void>>('/auth/reset-password', { identifier, otp, newPassword });
  }

  sendOtp(identifier: string, purpose: string) {
    return http.post<ApiResponse<{ message: string; otp: string }>>('/auth/otp/send', { identifier, purpose });
  }

  verifyOtp(identifier: string, otp: string, purpose: string) {
    return http.post<ApiResponse<void>>('/auth/otp/verify', { identifier, otp, purpose });
  }
}

class UserApiService extends BaseApiService {
  protected basePath = '/users';

  getMe() {
    return http.get<ApiResponse<User>>(`${this.basePath}/me`);
  }

  updateProfile(data: { name?: string; email?: string }) {
    return http.put<ApiResponse<User>>(`${this.basePath}/me`, data);
  }

  getAddresses() {
    return http.get<ApiResponse<Address[]>>(`${this.basePath}/me/addresses`);
  }

  addAddress(data: Omit<Address, 'id' | 'createdAt'>) {
    return http.post<ApiResponse<Address>>(`${this.basePath}/me/addresses`, data);
  }

  updateAddress(id: string, data: Partial<Address>) {
    return http.put<ApiResponse<Address>>(`${this.basePath}/me/addresses/${id}`, data);
  }

  deleteAddress(id: string) {
    return http.delete<ApiResponse<void>>(`${this.basePath}/me/addresses/${id}`);
  }
}

class ShopApiService extends BaseApiService {
  protected basePath = '/shops';

  getAll(page = 0, size = 20) {
    return http.get<ApiResponse<PagedResponse<Shop>>>(`${this.basePath}?page=${page}&size=${size}`);
  }

  getNearby(lat: number, lng: number, radius = 10, limit = 20) {
    return http.get<ApiResponse<Shop[]>>(`${this.basePath}/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`);
  }

  getById(id: string) {
    return http.get<ApiResponse<Shop>>(`${this.basePath}/${id}`);
  }

  getDetails(id: string) {
    return http.get<ApiResponse<ShopDetails>>(`${this.basePath}/${id}/details`);
  }
}

class OrderApiService extends BaseApiService {
  protected basePath = '/orders';

  getPriceEstimate(data: PriceEstimateRequest) {
    return http.post<ApiResponse<PriceEstimateResponse>>(`${this.basePath}/price-estimate`, data);
  }

  create(data: CreateOrderRequest) {
    return http.post<ApiResponse<Order>>(this.basePath, data);
  }

  getById(id: string) {
    return http.get<ApiResponse<Order>>(`${this.basePath}/${id}`);
  }

  getByNumber(orderNumber: string) {
    return http.get<ApiResponse<Order>>(`${this.basePath}/number/${orderNumber}`);
  }

  getMyOrders(page = 0, size = 10) {
    return http.get<ApiResponse<PagedResponse<Order>>>(`${this.basePath}?page=${page}&size=${size}`);
  }

  updateStatus(id: string, data: { status: string; notes?: string; rejectionReason?: string }) {
    return http.put<ApiResponse<Order>>(`${this.basePath}/${id}/status`, data);
  }

  reorder(id: string) {
    return http.post<ApiResponse<Order>>(`${this.basePath}/${id}/reorder`);
  }

  deleteOrder(id: number) {
    return http.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
  }
}

class FileApiService extends BaseApiService {
  protected basePath = '/files';

  async upload(file: File): Promise<ApiResponse<{ fileName: string; originalName: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    const token = this.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Upload failed (${response.status})`);
    }
    return json as ApiResponse<{ fileName: string; originalName: string }>;
  }

  getDownloadUrl(fileName: string): string {
    return `${API_BASE_URL}/files/download/${fileName}`;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const authData = localStorage.getItem('printhub-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.accessToken || null;
      }
    } catch {
      // ignore
    }
    return localStorage.getItem('accessToken');
  }
}

class PaymentApiService extends BaseApiService {
  protected basePath = '/payments';

  submit(data: { orderId: number; utr: string; screenshotPath?: string }) {
    return http.post<ApiResponse<Payment>>(`${this.basePath}/submit`, data);
  }

  getUpiPay(orderId: number) {
    return http.get<ApiResponse<UpiPayResponse>>(`${this.basePath}/upi-pay/${orderId}`);
  }
}

class AdminApiService extends BaseApiService {
  protected basePath = '/admin';

  getOrders(page = 0, size = 20) {
    return http.get<ApiResponse<PagedResponse<Order>>>(`${this.basePath}/orders?page=${page}&size=${size}`);
  }

  updateOrderStatus(id: number, data: { status: string; notes?: string }) {
    return http.put<ApiResponse<Order>>(`${this.basePath}/orders/${id}/status`, data);
  }

  getPendingPayments() {
    return http.get<ApiResponse<Payment[]>>(`${this.basePath}/payments/pending`);
  }

  approvePayment(id: number) {
    return http.post<ApiResponse<Payment>>(`${this.basePath}/payments/${id}/approve`, {});
  }

  rejectPayment(id: number, reason?: string) {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return http.post<ApiResponse<Payment>>(`${this.basePath}/payments/${id}/reject${query}`, {});
  }

  ping() {
    return http.get<ApiResponse<string>>(`${this.basePath}/ping`);
  }

  deleteOrder(id: number) {
    return http.delete<ApiResponse<void>>(`${this.basePath}/orders/${id}`);
  }
}

// ─── Singleton Exports ───────────────────────────────────────────────────────

export const authApi = new AuthApiService();
export const userApi = new UserApiService();
export const shopApi = new ShopApiService();
export const orderApi = new OrderApiService();
export const fileApi = new FileApiService();
export const paymentApi = new PaymentApiService();
export const adminApi = new AdminApiService();
