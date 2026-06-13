import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id:    number
  name:  string
  email: string
  role:  'admin' | 'incident_manager' | 'investigator' | 'risk_analyst' | 'reporter'
}

interface AuthState {
  token:   string | null
  user:    AuthUser | null
  setAuth: (token: string, user: AuthUser) => void
  logout:  () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:   null,
      user:    null,
      setAuth: (token, user) => set({ token, user }),
      logout:  () => set({ token: null, user: null }),
    }),
    { name: 'ims-auth' }
  )
)
