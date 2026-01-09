export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-solid border-[#e7edf3] dark:border-[#2a3641] px-6 py-4 bg-white dark:bg-[#111a22]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
            <span className="material-symbols-outlined text-3xl"></span>
          </div>
          <h2 className="text-xl font-bold tracking-[-0.015em]">BizFlow</h2>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 w-full">

        {/* Left */}
        <div className="flex w-full md:w-1/2 lg:w-5/12 flex-col justify-center items-center px-6 py-10 bg-white dark:bg-[#111a22]">
          <div className="w-full max-w-[480px] space-y-8">

            {/* Title */}
            <div className="space-y-2">
              <p className="text-[32px] font-bold">Đăng nhập</p>
              <p className="text-sm text-[#617589] dark:text-gray-400">
                Chào mừng quay trở lại! Vui lòng nhập thông tin của bạn để tiếp tục.
              </p>
            </div>

            {/* Form (UI only) */}
            <form className="space-y-6">

              {/* Username */}
              <div className="space-y-2">
                <label className="font-semibold">Tên đăng nhập hoặc Số điện thoại</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c739a]">
                    person
                  </span>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0912345678"
                    className="w-full h-14 rounded-xl border pl-12 pr-4 bg-[#f8f9fa] dark:bg-[#1a2632] outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="font-semibold">Mật khẩu</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c739a]">
                    lock
                  </span>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu của bạn"
                    className="w-full h-14 rounded-xl border pl-12 pr-4 bg-[#f8f9fa] dark:bg-[#1a2632] outline-none focus:border-primary"
                  />
                </div>

                <div className="text-right">
                  <a href="#" className="text-sm font-semibold text-primary">
                    Quên mật khẩu?
                  </a>
                </div>
              </div>

              {/* Submit */}
              <button className="w-full h-14 rounded-xl bg-primary text-white font-bold hover:bg-blue-600">
                Đăng nhập
              </button>
            </form>

            {/* Support */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 flex gap-3 items-center">
              <span className="material-symbols-outlined text-primary">help</span>
              <a href="/help" className="font-bold">
                Cần trợ giúp?
              </a>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="hidden md:flex md:w-1/2 lg:w-7/12 bg-[#f0f4f8] dark:bg-[#0d1218] items-center justify-center">
          <div
            className="w-[80%] h-[70%] rounded-2xl bg-cover bg-center shadow-xl"
            style={{
              backgroundImage:
                'url("https://bcp.cdnchinhphu.vn/334894974524682240/2024/7/16/nentangso-17211159723762009278188.jpg")',
            }}
          />
        </div>

      </main>
    </div>
  );
}
