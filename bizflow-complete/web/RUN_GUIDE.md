# 🌐 Web Frontend - Hướng dẫn Chạy

**Platform**: Next.js 14 + React 18 + TypeScript  

---

## 🚀 Chạy nhanh (2 lệnh)

```bash
cd web
npm install
npm run dev
```

✅ Truy cập: http://localhost:3000

---

## 📋 Hướng dẫn Chi tiết

### Bước 1: Kiểm tra Node.js

```bash
node --version
npm --version
# Node phải >= 18.0.0
```

Nếu chưa có Node.js:
- Download: https://nodejs.org/
- Hoặc dùng `choco install nodejs` (Windows)

### Bước 2: Cài đặt Dependencies

```bash
cd web
npm install
```

**Các package chính**:
- next (React framework)
- react (UI library)
- typescript (type safety)
- tailwindcss (styling)
- axios (HTTP client)
- zustand (state management)

### Bước 3: Cấu hình Environment

Tạo file `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=BizFlow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Bước 4: Chạy Development Server

```bash
npm run dev
```

Kết quả mong đợi:
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - ready in 2.3s
```

---

## 🌐 Các trang chính

| URL | Mô tả |
|-----|-------|
| http://localhost:3000 | Trang chủ |
| http://localhost:3000/login | Đăng nhập |
| http://localhost:3000/register | Đăng ký |
| http://localhost:3000/dashboard | Dashboard chủ hộ (KPI, charts) |
| http://localhost:3000/dashboard/owner/products | Quản lý sản phẩm |
| http://localhost:3000/dashboard/owner/orders | Quản lý đơn hàng |
| http://localhost:3000/dashboard/owner/customers | Quản lý khách hàng |
| http://localhost:3000/dashboard/owner/reports | Báo cáo phân tích |

---

## 📁 Cấu trúc Dự án

```
web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Trang chủ
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx       # Trang đăng nhập
│   │   │   └── register/page.tsx    # Trang đăng ký
│   │   └── (dashboard)/owner/
│   │       ├── dashboard/page.tsx   # Dashboard KPIs
│   │       ├── products/page.tsx    # Quản lý sản phẩm
│   │       ├── orders/page.tsx      # Quản lý đơn hàng
│   │       ├── customers/page.tsx   # Quản lý khách hàng
│   │       └── reports/page.tsx     # Báo cáo
│   │
│   ├── components/
│   │   ├── ui/                      # UI components
│   │   └── providers/               # Context providers
│   │
│   ├── services/
│   │   ├── api.service.ts          # Axios HTTP client
│   │   └── auth.service.ts         # Authentication logic
│   │
│   ├── store/
│   │   └── useAuthStore.ts         # Zustand state
│   │
│   └── types/
│       └── index.ts                # TypeScript types
│
├── public/                          # Static files
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts              # Tailwind config
└── next.config.ts                  # Next.js config
```

---

## 🧪 Test ứng dụng

### 1. Đăng nhập Demo

- Email: `demo@bizflow.com`
- Password: `demo123`

### 2. Tạo tài khoản mới

- Truy cập http://localhost:3000/register
- Điền thông tin cửa hàng
- Đăng ký và đăng nhập

### 3. Kiểm tra chức năng

- Thử các trang trong sidebar
- Kiểm tra Browser Console (F12) xem có lỗi không
- Xem Network tab để kiểm tra API calls

---

## 🛠️ Lệnh Development

### Build Production

```bash
npm run build
npm run start
```

### TypeScript Check

```bash
npm run build
# hoặc
npx tsc --noEmit
```

### Lint Code

```bash
npm run lint
```

### Clean Cache

```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

---

## 🐛 Xử lý Lỗi

### Lỗi: "Port 3000 đã được sử dụng"

```bash
# Dùng port khác
npm run dev -- -p 3001
```

### Lỗi: "Cannot find module"

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "API connection failed"

Kiểm tra:
1. Backend đang chạy tại http://localhost:8000
2. File `.env.local` có đúng API URL
3. Browser console (F12) xem chi tiết lỗi

### Lỗi TypeScript

```bash
# Kiểm tra lỗi type
npx tsc --noEmit

# Build để xem tất cả lỗi
npm run build
```

---

## 🎨 Styling

### Framework
- **Tailwind CSS**: Utility-first CSS
- **PostCSS**: CSS processing

### Màu sắc chính
- Primary Blue: `#2563EB`
- Success Green: `#10B981`
- Error Red: `#EF4444`
- Neutral Grays: `#F9FAFB` - `#111827`

### Responsive
- Mobile-first approach
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`

---

## 🔌 Tích hợp Backend

### Luồng API Calls

```
User Action → Component → API Service → Backend API → Response → Update State → Re-render
```

### Ví dụ: Login Flow

```typescript
const handleLogin = async (email, password) => {
  // 1. Gọi API
  const response = await authService.login(email, password);
  
  // 2. Cập nhật Zustand store
  useAuthStore.setState({ user: response.user, token: response.token });
  
  // 3. Chuyển trang
  router.push('/dashboard');
};
```

---

**Trạng thái**: ✅ Sẵn sàng chạy  
**Cập nhật**: 31/01/2026
