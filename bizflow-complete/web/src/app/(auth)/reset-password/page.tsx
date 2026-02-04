"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const router = useRouter()

  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  /* =========================
     Init token from URL
     ========================= */
  useEffect(() => {
    const t = params.get('token')
    if (t) setToken(t)
  }, [params])

  /* =========================
     Auto redirect after success
     ========================= */
  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      router.push('/login')
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, router])

  /* =========================
     Validation helpers
     ========================= */
  const isStrongPassword = (pwd: string) =>
    pwd.length >= 8 && /[A-Z]/.test(pwd) && /\d/.test(pwd)

  const getPasswordStrength = () => {
    if (!password) return ''
    if (password.length < 8) return 'Yếu'
    if (!/[A-Z]/.test(password) || !/\d/.test(password)) return 'Trung bình'
    return 'Mạnh'
  }

  /* =========================
     Submit handler
     ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!token) {
      setError('Thiếu token đặt lại mật khẩu')
      return
    }

    if (!isStrongPassword(password)) {
      setError('Mật khẩu phải ≥ 8 ký tự, có chữ hoa và số')
      return
    }

    if (password !== confirm) {
      setError('Mật khẩu nhập lại không khớp')
      return
    }

    try {
      setLoading(true)

      await authService.resetPassword(token, password)

      setMessage('Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...')
      setCountdown(5)
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const msg =
        typeof detail === 'string'
          ? detail
          : err?.message || 'Đặt lại mật khẩu thất bại'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     UI
     ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">
            Đặt lại mật khẩu
          </h1>
          <p className="text-gray-600 mt-2">
            Tạo mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
            {countdown !== null && (
              <div className="mt-1 text-xs">
                Tự động chuyển sau {countdown}s
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token xác thực
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Dán token từ email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Token được gửi qua email khôi phục mật khẩu
            </p>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
            {password && (
              <p className="text-xs mt-1 text-gray-600">
                Độ mạnh: <span className="font-medium">{getPasswordStrength()}</span>
              </p>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="text-indigo-600 hover:underline"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
