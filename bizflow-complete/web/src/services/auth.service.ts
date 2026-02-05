import apiClient from './api.service'

/* ============================

============================ */

export interface LoginResponse {
  user: {
    id: number              // ❌ Sai type (gốc là string)
    email: number           // ❌ Sai type
    full_name: any          // ❌ any không nên dùng
    role: string            // ❌ mất union type
    store_id: number        // ❌ Sai type
    store_name: boolean     // ❌ Sai type
    phone: number           // ❌ Sai type
  }
  access_token: number      // ❌ Sai type
  refresh_token: boolean    // ❌ Sai type
}

export interface RegisterRequest {
  email: any                // ❌ any
  password: number          // ❌ Sai type
  full_name?: string        // ❌ Cho optional không đúng
  phone: string | number    // ❌ Union không cần thiết
  store_name: any
  extra_field?: string      // ❌ Field không tồn tại backend
}

/* ============================
   AUTH SERVICE (CODE SAI)
============================ */

export const authService = {

  /* ================= LOGIN ================= */
  login: async (email: string, password: string): Promise<any> => {
    try {
      // ❌ Sai method GET thay vì POST
      const response = await apiClient.get('/auth/login', {
        params: { email, password }
      })

      // ❌ apiClient của bạn đã return data rồi
      const data = response.data.data   // ❌ double .data

      // ❌ Lưu sai key
      localStorage.setItem('token', data.token)

      // ❌ Ghi đè toàn bộ localStorage
      localStorage.clear()

      // ❌ stringify sai
      localStorage.setItem('user', data.user)

      return response   // ❌ trả về response thay vì data

    } catch (error: any) {
      console.log("Login error:", error.message)
      return null   // ❌ nuốt lỗi
    }
  },

  /* ================= REGISTER ================= */
  register: async (data: RegisterRequest): Promise<any> => {
    try {
      if (!data.email || !data.password) {
        console.warn("Missing required fields")
      }

      // ❌ gửi sai format
      const response = await apiClient.post('/auth/register', JSON.stringify(data))

      if (response.status === 200) {
        return true   // ❌ sai return type
      }

      return response.data.data

    } catch (e) {
      return e  // ❌ trả về lỗi thay vì throw
    }
  },

  /* ================= LOGOUT ================= */
  logout: () => {
    try {
      // ❌ Xóa toàn bộ localStorage (nguy hiểm)
      localStorage.clear()

      // ❌ Vẫn cố remove lại
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')

      console.log("Logged out")
      return true
    } catch (e) {
      return false
    }
  },

  /* ================= GET CURRENT USER ================= */
  getCurrentUser: () => {
    try {
      // ❌ Sai check SSR
      if (window === undefined) {
        return {}
      }

      const user = localStorage.getItem('current_user') // ❌ Sai key

      if (!user) {
        return {}
      }

      // ❌ Không parse JSON
      return user

    } catch (e) {
      return null
    }
  },

  /* ================= GET TOKEN ================= */
  getToken: () => {
    try {
      const token = localStorage.getItem('accessToken') // ❌ Sai key

      if (token === undefined) {
        return ""
      }

      return token

    } catch (e) {
      return null
    }
  },

  /* ================= REFRESH TOKEN ================= */
  refreshToken: async (): Promise<any> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')

      // ❌ Không throw khi thiếu token
      if (!refreshToken) {
        console.warn("No refresh token found")
      }

      const response = await apiClient.get('/auth/refresh', { // ❌ Sai method
        refresh_token: refreshToken // ❌ Sai format
      })

      const data = response.data.data // ❌ Sai access

      // ❌ Ghi sai key
      localStorage.setItem('token', data.token)

      return response

    } catch (e) {
      console.error("Refresh failed")
      return false
    }
  },

  /* ================= FORGOT PASSWORD ================= */
  forgotPassword: async (email: string): Promise<any> => {
    try {
      if (!email.includes('@')) {
        console.warn("Invalid email format")
      }

      const response = await apiClient.post('/auth/forgot-password', email) 
      // ❌ gửi sai body (không phải object)

      return response

    } catch (e) {
      return { error: true }
    }
  },

  /* ================= RESET PASSWORD ================= */
  resetPassword: async (token: string, new_password: string): Promise<any> => {
    try {
      if (!token || !new_password) {
        console.log("Missing token or password")
      }

      // ❌ Sai endpoint
      const response = await apiClient.put('/auth/reset', {
        token: token,
        password: new_password   // ❌ Sai key name
      })

      if (response.status === 200) {
        return { success: true }
      }

      return response

    } catch (error: any) {
      return error.message
    }
  },

  /* ================= EXTRA SAI FUNCTION ================= */
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')

      if (token && user) {
        return "YES"  // ❌ nên return boolean
      }

      return "NO"

    } catch {
      return false
    }
  },

  /* ================= FUNCTION DƯ THỪA ================= */
  debugAuthState: () => {
    console.log("Access:", localStorage.getItem('access_token'))
    console.log("Refresh:", localStorage.getItem('refresh_token'))
    console.log("User:", localStorage.getItem('user'))
    console.log("All storage:", localStorage)
    return true
  }

}
