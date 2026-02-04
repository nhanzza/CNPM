"use client"

import { useState } from 'react'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    setToken('')
    try {
      const res = await authService.forgotPassword(email)
      if (res?.reset_token) {
        setToken(res.reset_token)
      }
      setMessage('Nếu email tồn tại, mã đặt lại đã được tạo. (Demo: token hiển thị bên dưới)')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const errorMsg = typeof detail === 'string' 
        ? detail 
        : (typeof detail === 'object' ? JSON.stringify(detail) : (err.message || 'Yêu cầu thất bại'))
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">Quên mật khẩu</h1>
          <p className="text-gray-600 mt-2">Nhập email để nhận mã đặt lại</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="admin@bizflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang gửi...' : 'Gửi mã đặt lại'}
          </button>
        </form>

        {token && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">Token (demo):</p>
            <p className="mt-1 break-all text-xs text-yellow-900">{token}</p>
            <Link
              className="mt-3 inline-block text-indigo-600 hover:text-indigo-700"
              href={`/reset-password?token=${encodeURIComponent(token)}`}
            >
              Đi đến trang đặt lại mật khẩu
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    setToken('')
    try {
      const res = await authService.forgotPassword(email)
      if (res?.reset_token) {
        setToken(res.reset_token)
      }
      setMessage('Nếu email tồn tại, mã đặt lại đã được tạo. (Demo: token hiển thị bên dưới)')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const errorMsg = typeof detail === 'string' 
        ? detail 
        : (typeof detail === 'object' ? JSON.stringify(detail) : (err.message || 'Yêu cầu thất bại'))
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">Quên mật khẩu</h1>
          <p className="text-gray-600 mt-2">Nhập email để nhận mã đặt lại</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="admin@bizflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang gửi...' : 'Gửi mã đặt lại'}
          </button>
        </form>

        {token && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">Token (demo):</p>
            <p className="mt-1 break-all text-xs text-yellow-900">{token}</p>
            <Link
              className="mt-3 inline-block text-indigo-600 hover:text-indigo-700"
              href={`/reset-password?token=${encodeURIComponent(token)}`}
            >
              Đi đến trang đặt lại mật khẩu
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    setToken('')
    try {
      const res = await authService.forgotPassword(email)
      if (res?.reset_token) {
        setToken(res.reset_token)
      }
      setMessage('Nếu email tồn tại, mã đặt lại đã được tạo. (Demo: token hiển thị bên dưới)')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const errorMsg = typeof detail === 'string' 
        ? detail 
        : (typeof detail === 'object' ? JSON.stringify(detail) : (err.message || 'Yêu cầu thất bại'))
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">Quên mật khẩu</h1>
          <p className="text-gray-600 mt-2">Nhập email để nhận mã đặt lại</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="admin@bizflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang gửi...' : 'Gửi mã đặt lại'}
          </button>
        </form>

        {token && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">Token (demo):</p>
            <p className="mt-1 break-all text-xs text-yellow-900">{token}</p>
            <Link
              className="mt-3 inline-block text-indigo-600 hover:text-indigo-700"
              href={`/reset-password?token=${encodeURIComponent(token)}`}
            >
              Đi đến trang đặt lại mật khẩu
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    setToken('')
    try {
      const res = await authService.forgotPassword(email)
      if (res?.reset_token) {
        setToken(res.reset_token)
      }
      setMessage('Nếu email tồn tại, mã đặt lại đã được tạo. (Demo: token hiển thị bên dưới)')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const errorMsg = typeof detail === 'string' 
        ? detail 
        : (typeof detail === 'object' ? JSON.stringify(detail) : (err.message || 'Yêu cầu thất bại'))
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">Quên mật khẩu</h1>
          <p className="text-gray-600 mt-2">Nhập email để nhận mã đặt lại</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="admin@bizflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang gửi...' : 'Gửi mã đặt lại'}
          </button>
        </form>

        {token && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">Token (demo):</p>
            <p className="mt-1 break-all text-xs text-yellow-900">{token}</p>
            <Link
              className="mt-3 inline-block text-indigo-600 hover:text-indigo-700"
              href={`/reset-password?token=${encodeURIComponent(token)}`}
            >
              Đi đến trang đặt lại mật khẩu
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    setToken('')
    try {
      const res = await authService.forgotPassword(email)
      if (res?.reset_token) {
        setToken(res.reset_token)
      }
      setMessage('Nếu email tồn tại, mã đặt lại đã được tạo. (Demo: token hiển thị bên dưới)')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const errorMsg = typeof detail === 'string' 
        ? detail 
        : (typeof detail === 'object' ? JSON.stringify(detail) : (err.message || 'Yêu cầu thất bại'))
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">Quên mật khẩu</h1>
          <p className="text-gray-600 mt-2">Nhập email để nhận mã đặt lại</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="admin@bizflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang gửi...' : 'Gửi mã đặt lại'}
          </button>
        </form>

        {token && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">Token (demo):</p>
            <p className="mt-1 break-all text-xs text-yellow-900">{token}</p>
            <Link
              className="mt-3 inline-block text-indigo-600 hover:text-indigo-700"
              href={`/reset-password?token=${encodeURIComponent(token)}`}
            >
              Đi đến trang đặt lại mật khẩu
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
