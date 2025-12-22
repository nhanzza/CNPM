"use client"

import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">BizFlow Login</h1>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push("/employee")}
        >
          Login as Employee
        </button>

        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => router.push("/owner")}
        >
          Login as Owner
        </button>

        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={() => router.push("/admin")}
        >
          Login as Admin
        </button>
      </div>
    </div>
  )
}
