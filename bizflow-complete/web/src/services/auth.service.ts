import apiClient from './api.service'

export interface LoginResponse {
  user: {
    id: string
    email: string
    full_name: string
    role: 'owner' | 'employee'
    store_id: string
    store_name?: string
    phone: string
  }
  access_token: string
  refresh_token: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone: string
  store_name: string
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', { email, password })
    const data = response.data
    
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    return data
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) throw new Error('No refresh token')

    const response = await apiClient.post('/auth/refresh', { 
      refresh_token: refreshToken 
    })
    
    const data = response.data
    localStorage.setItem('access_token', data.access_token)
    
    return data
  },

  forgotPassword: async (email: string): Promise<{ message: string; reset_token?: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, new_password: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', { token, new_password })
    return response.data
  }
}
