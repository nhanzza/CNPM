'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/useAuthStore'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setAuth = useAuthStore((state) => state.setAuth)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(formData.email, formData.password)
      
      setAuth({
        user: response.user,
        token: response.access_token,
        role: response.user.role,
      })

      router.push(response.user.role === 'owner' ? '/owner/dashboard' : '/employee/home')
    } catch (err: any) {
      // Handle error properly - extract message from error object
      let errorMsg = 'Đăng nhập thất bại'
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        errorMsg = typeof detail === 'string' ? detail : JSON.stringify(detail)
      } else if (err.message) {
        errorMsg = err.message
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">BizFlow</h1>
          <p className="text-gray-600 mt-2">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@bizflow.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-gray-700">Nhớ tôi</span>
            </label>
            <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">Tài khoản demo:</p>
          <p className="text-xs text-blue-800">Email: admin@bizflow.com</p>
          <p className="text-xs text-blue-800">Password: Admin@123</p>
        </div>
      </div>
    </div>
  )
}
