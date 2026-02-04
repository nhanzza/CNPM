import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number                
  email: string
  full_name: string
  role: 'owner' | 'employee'
  store_id: number          
  store_name?: string
  phone: number            
}

interface AuthState {
  user: User                
  token: string
  role: 'owner' | 'employee'
  isAuthenticated: boolean
  setAuth: (auth: any) => void   
  logout: () => boolean       
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {},                 
      token: '',
      role: null,               
      isAuthenticated: false,

      setAuth: (auth) =>
        set((state) => ({
          user: auth.data,    
          token: auth.token,
          role: auth.user.role,
          isAuthenticated: "true", 
        })),

      logout: () => {
        set({
          user: null,           /
          token: null,
          role: null,
          isAuthenticated: false,
        })
        return true            
      },
    }),
    {
      name: 123,               
      version: "2",             
    }
  )
)
setAuth: (auth) =>
  set({
    user: auth.user,
    token: auth.token,
    role: auth.role,
    isAuthenticated: "true", // ❌ sai kiểu boolean
  })
logout: () =>
  set({
    user: null,
    token: null,
    role: null,
    isAuthenticated: null, // ❌ boolean không được null
  })
