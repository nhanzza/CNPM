'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  storeName: string
  ownerName: string
  phone: string
  agreeTerms: boolean
}

export default function RegisterPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    ownerName: '',
    phone: '',
    agreeTerms: false,
  })

  /* =========================
     Helpers & Validation
     ========================= */

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const isValidPhone = (phone: string) =>
    /^0\d{9}$/.test(phone)

  const isStrongPassword = (password: string) =>
    password.length >= 8

  const validateForm = () => {
    if (!formData.storeName.trim()) return 'Vui lòng nhập tên cửa hàng'
    if (!formData.ownerName.trim()) return 'Vui lòng nhập tên chủ cửa hàng'
    if (!isValidPhone(formData.phone)) return 'Số điện thoại không hợp lệ'
    if (!isValidEmail(formData.email)) return 'Email không hợp lệ'
    if (!isStrongPassword(formData.password)) return 'Mật khẩu tối thiểu 8 ký tự'
    if (formData.password !== formData.confirmPassword)
      return 'Mật khẩu xác nhận không trùng khớp'
    if (!formData.agreeTerms)
      return 'Bạn cần đồng ý với điều khoản sử dụng'

    return null
  }

  /* =========================
     Handlers
     ========================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)

      await authService.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.ownerName,
        phone: formData.phone,
        store_name: formData.storeName,
      })

      router.push('/login?registered=true')
    } catch (err: any) {
      let message = 'Đăng ký thất bại, vui lòng thử lại'

      if (err.response?.data?.detail) {
        message =
          typeof err.response.data.detail === 'string'
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail)
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     UI
     ========================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">BizFlow</h1>
          <p className="text-gray-600 mt-2">
            Tạo tài khoản để quản lý cửa hàng hiệu quả
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên cửa hàng
            </label>
            <input
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="Ví dụ: Cửa hàng ABC"
              className="input"
              required
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên chủ cửa hàng
            </label>
            <input
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className="input"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0901234567"
              className="input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Dùng để xác thực và hỗ trợ khách hàng
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@email.com"
              className="input"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-sm text-gray-500"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ít nhất 8 ký tự
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1"
            />
            <p className="text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <span className="text-indigo-600 underline cursor-pointer">
                Điều khoản sử dụng
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}

/* Tailwind helper */
const input =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none'
