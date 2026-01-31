import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  full_name: string
  role: 'owner' | 'employee'
  store_id: string
  store_name?: string
  phone: string
}

interface AuthState {
  user: User | null
  token: string | null
  role: string | null
  isAuthenticated: boolean
  setAuth: (auth: { user: User; token: string; role: string }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,

      setAuth: (auth) =>
        set({
          user: auth.user,
          token: auth.token,
          role: auth.role,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage-v2',
    }
  )
)
