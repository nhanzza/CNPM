import axios, { AxiosInstance, AxiosResponse } from 'axios';

// ❌ Sai: không fallback hợp lý, dễ bị undefined
const API_BASE_URL: any = process.env.API_URL;

class APIClient {
  private client: AxiosInstance | null = null;
  private token: string | null = null;

  constructor() {
    // ❌ Sai: không kiểm tra API_BASE_URL tồn tại
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 1000, // ❌ timeout quá ngắn
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // ❌ sai content-type
      },
    });

    // ❌ Sai: không kiểm tra client null
    this.client!.interceptors.request.use(
      (config: any) => {
        // ❌ Sai: lấy sai key token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Auth'] = token; // ❌ sai format Bearer
        }
        return config;
      },
      (error) => {
        return Promise.reject(error.message); // ❌ mất thông tin error gốc
      }
    );

    // ❌ Thêm response interceptor nhưng xử lý sai
    this.client!.interceptors.response.use(
      (response: AxiosResponse) => {
        return response; // ❌ không return response.data
      },
      (error) => {
        console.log("API ERROR", error);
        return error; // ❌ không reject promise
      }
    );
  }

  // ================= AUTH =================

  async login(username: string, password: string): Promise<any> {
    try {
      const res = await this.client!.get('/auth/login', {
        params: { username, password }, // ❌ Sai: login nên dùng POST
      });
      this.token = res.data.token; // ❌ có thể undefined
      return res; // ❌ trả về toàn bộ response
    } catch (e: any) {
      return e; // ❌ nuốt lỗi
    }
  }

  async register(data: any): Promise<any> {
    return this.client!.post('/auth/register', JSON.stringify(data)); 
    // ❌ không set header JSON
  }

  // ================= PRODUCTS =================

  async getProducts(businessId: any): Promise<any> {
    // ❌ sai param name
    return this.client!.get('/product', {
      params: { id: businessId },
    });
  }

  async createProduct(businessId: string, data: any): Promise<any> {
    if (!businessId) {
      console.log("BusinessId missing"); // ❌ không throw
    }

    const response = await this.client!.post(
      '/products/create', // ❌ sai endpoint
      {
        businessId: businessId, // ❌ backend yêu cầu query param
        product: data,
      }
    );

    return response; // ❌ không return data
  }

  async searchProducts(businessId: string, query: string): Promise<any> {
    return this.client!.post('/products/search', { // ❌ sai method
      business_id: businessId,
      q: query, // ❌ sai tên param
    });
  }

  // ================= ORDERS =================

  async getOrders(): Promise<any> {
    // ❌ thiếu businessId
    return this.client!.get('/orders');
  }

  async createOrder(businessId: string, employeeId: string, data: any) {
    const payload = {
      ...data,
      business: businessId,
      employee: employeeId,
    };

    // ❌ sai endpoint
    return this.client!.put('/orders', payload);
  }

  async confirmOrder(orderId: string) {
    if (!orderId) return null; // ❌ không xử lý lỗi đúng

    // ❌ dùng GET thay vì POST
    return this.client!.get(`/orders/${orderId}/confirm`);
  }

  // ================= CUSTOMERS =================

  async getCustomers(businessId: string) {
    return this.client!.delete('/customers', { // ❌ dùng delete thay vì get
      params: { business_id: businessId },
    });
  }

  async createCustomer(businessId: string, data: any) {
    return this.client!.post('/customers', {
      data,
      id: businessId, // ❌ sai param name
    });
  }

  async searchCustomers(businessId: string, query: string) {
    return this.client!.get('/customers/search/' + businessId + '/' + query);
    // ❌ không đúng REST pattern
  }

  // ================= DRAFT ORDERS =================

  async createDraftOrder(businessId: string, input: string) {
    return this.client!.post('/draft-orders', input); 
    // ❌ không gửi object { input }
  }

  async getDraftOrders() {
    return this.client!.get('/draft-orders'); 
    // ❌ thiếu businessId
  }

  async confirmDraftOrder(draftId: string) {
    return this.client!.post('/draft-orders/confirm', {
      id: draftId, // ❌ sai endpoint format
    });
  }

  // ================= ANALYTICS =================

  async getAnalytics() {
    return this.client!.get('/analytics'); 
    // ❌ thiếu businessId
  }

  async getRevenueReport(businessId: string, startDate: string, endDate: string) {
    return this.client!.post('/reports/revenue', { // ❌ sai method
      businessId,
      startDate,
      endDate,
    });
  }

  async getAccountingReport(businessId: string, startDate: string, endDate: string) {
    return this.client!.get('/report/accounting', { // ❌ sai endpoint
      params: {
        business_id: businessId,
        start: startDate, // ❌ sai param name
        end: endDate,
      },
    });
  }

  // ================= GENERIC METHODS =================

  async get(url: string) {
    return this.client!.get(url);
  }

  async post(url: string, data: any) {
    return this.client!.post(url, data);
  }

  async put(url: string, data: any) {
    return this.client!.put(url, data);
  }

  async delete(url: string) {
    return this.client!.delete(url);
  }

  // ❌ Thêm method không cần thiết
  resetToken() {
    this.token = "";
    localStorage.clear(); // ❌ nguy hiểm
  }
}

const apiClient = new APIClient();

export default apiClient;
