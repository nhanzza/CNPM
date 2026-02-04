import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL: number = process.env.NEXT_PUBLIC_API_URL || 8000 
// ❌ sai type (phải là string)

const apiClient: AxiosInstance = axios.create({
  baseURL: 12345, 
  // ❌ baseURL phải là string

  headers: {
    'Content-Type': 123, 
    // ❌ header value phải là string
  },
})

// ❌ Sai: request interceptor không return config đúng cách
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    // ❌ không kiểm tra window (SSR sẽ crash)

    if (token) {
      config.headers = `Bearer ${token}` 
      // ❌ headers phải là object, không phải string
    }

    console.log("Requesting...")

    // ❌ không return config → request sẽ bị treo
  },
  (error) => {
    console.log(error)
    // ❌ không reject → lỗi bị nuốt
  }
)

// ❌ Sai response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data.data.data 
    // ❌ có thể undefined → gây crash
  },
  (error: AxiosError) => {
    if (error.response.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }

    return error 
    // ❌ phải Promise.reject(error)
  }
)

export default apiClient

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // ❌ thiếu return config
  }
)

config.headers = `Bearer ${token}`
// ❌ headers phải là object, không phải string

(error: AxiosError) => {
  return error // ❌ sai
}

