import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth API
  async login(username: string, password: string) {
    const response = await this.client.post('/auth/login', { username, password });
    return response.data;
  }

  async register(data: any) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  // Products API
  async getProducts(businessId: string) {
    const response = await this.client.get('/products', { params: { business_id: businessId } });
    return response.data;
  }

  async createProduct(businessId: string, data: any) {
    const response = await this.client.post('/products', data, { params: { business_id: businessId } });
    return response.data;
  }

  async searchProducts(businessId: string, query: string) {
    const response = await this.client.get('/products/search', {
      params: { business_id: businessId, query },
    });
    return response.data;
  }

  // Orders API
  async getOrders(businessId: string) {
    const response = await this.client.get('/orders', { params: { business_id: businessId } });
    return response.data;
  }

  async createOrder(businessId: string, employeeId: string, data: any) {
    const response = await this.client.post('/orders', data, {
      params: { business_id: businessId, employee_id: employeeId },
    });
    return response.data;
  }

  async confirmOrder(orderId: string) {
    const response = await this.client.post(`/orders/${orderId}/confirm`);
    return response.data;
  }

  // Customers API
  async getCustomers(businessId: string) {
    const response = await this.client.get('/customers', { params: { business_id: businessId } });
    return response.data;
  }

  async createCustomer(businessId: string, data: any) {
    const response = await this.client.post('/customers', data, { params: { business_id: businessId } });
    return response.data;
  }

  async searchCustomers(businessId: string, query: string) {
    const response = await this.client.get('/customers/search', {
      params: { business_id: businessId, query },
    });
    return response.data;
  }

  // Draft Orders (AI) API
  async createDraftOrder(businessId: string, input: string) {
    const response = await this.client.post('/draft-orders', { input }, {
      params: { business_id: businessId },
    });
    return response.data;
  }

  async getDraftOrders(businessId: string) {
    const response = await this.client.get('/draft-orders', { params: { business_id: businessId } });
    return response.data;
  }

  async confirmDraftOrder(draftId: string) {
    const response = await this.client.post(`/draft-orders/${draftId}/confirm`);
    return response.data;
  }

  // Analytics API
  async getAnalytics(businessId: string) {
    const response = await this.client.get('/analytics', { params: { business_id: businessId } });
    return response.data;
  }

  async getRevenueReport(businessId: string, startDate: string, endDate: string) {
    const response = await this.client.get('/reports/revenue', {
      params: { business_id: businessId, start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  async getAccountingReport(businessId: string, startDate: string, endDate: string) {
    const response = await this.client.get('/reports/accounting', {
      params: { business_id: businessId, start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  // Generic HTTP methods
  async get(url: string, config?: any) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url: string, data?: any, config?: any) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url: string, data?: any, config?: any) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: any) {
    const response = await this.client.delete(url, config);
    return response.data;
  }}

const apiClient = new APIClient();
export default apiClient;