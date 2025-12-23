export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-[#1c2a3a] rounded-xl shadow-xl p-6">
        
        <h1 className="text-2xl font-bold text-center text-[#0d141b] dark:text-white mb-6">
          Đăng nhập BizFlow
        </h1>

        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-[#0d141b] dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-[#0d141b] dark:text-gray-200">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#137fec] text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Đăng nhập
          </button>
        </form>

      </div>
    </div>
  )
}
