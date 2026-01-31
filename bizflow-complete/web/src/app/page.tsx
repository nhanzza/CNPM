export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              BizFlow
            </h1>
            <p className="text-xl text-gray-600">
              Nền tảng hỗ trợ chuyển đổi số cho hộ kinh doanh
            </p>
          </div>
          
          {/* Navigation */}
          <nav className="flex gap-4 justify-center">
            <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Đăng Nhập
            </a>
            <a href="/register" className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition">
              Đăng Ký
            </a>
          </nav>
        </header>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">Quản Lý Hàng Hóa</h3>
            <p className="text-gray-600">
              Quản lý kho hàng, giá bán, tồn kho một cách dễ dàng
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🛒</div>
            <h3 className="text-xl font-bold mb-2">Tạo Đơn Hàng Nhanh</h3>
            <p className="text-gray-600">
              Tạo đơn hàng tại quầy, qua điện thoại, Zalo chỉ vài giây
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Quản Lý Công Nợ</h3>
            <p className="text-gray-600">
              Theo dõi công nợ khách hàng, thanh toán tự động
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Hỗ Trợ</h3>
            <p className="text-gray-600">
              Dùng giọng nói hoặc văn bản tạo đơn hàng tự động
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Báo Cáo & Phân Tích</h3>
            <p className="text-gray-600">
              Xem doanh thu, top bán chạy, nợ phải thu ngay tức thì
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Sổ Kế Toán Tự Động</h3>
            <p className="text-gray-600">
              Tạo sổ kế toán theo Circular 88/2021/TT-BTC tự động
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mt-16 bg-blue-600 text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng chuyển đổi số?
          </h2>
          <p className="mb-6 text-lg">
            Bắt đầu ngay hôm nay và trải nghiệm quản lý kinh doanh hiện đại
          </p>
          <a href="/register" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition inline-block">
            Đăng Ký Miễn Phí
          </a>
        </section>
      </div>
    </main>
  );
}
