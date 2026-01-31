"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const t = params.get('token')
    if (t) setToken(t)
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!token) {
      setError('Thiếu token đặt lại mật khẩu')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự')
      return
    }
    if (password !== confirm) {
      setError('Mật khẩu nhập lại không khớp')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setMessage('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const errorMsg = typeof detail === 'string' 
        ? detail 
        : (typeof detail === 'object' ? JSON.stringify(detail) : (err.message || 'Đặt lại thất bại'))
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">Đặt lại mật khẩu</h1>
          <p className="text-gray-600 mt-2">Nhập token và mật khẩu mới</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Token</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Dán token nhận được"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhập lại mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
