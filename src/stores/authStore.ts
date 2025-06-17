import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  level: number;
  xp: number;
  streak: number;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Demo users
const demoUsers: Record<string, User> = {
  'student@neutraledu.com': {
    id: '1',
    email: 'student@neutraledu.com',
    name: 'Ahmet Yılmaz',
    role: 'student',
    level: 12,
    xp: 2450,
    streak: 7,
  },
  'admin@neutraledu.com': {
    id: '2',
    email: 'admin@neutraledu.com',
    name: 'Admin Kullanıcı',
    role: 'admin',
    level: 50,
    xp: 10000,
    streak: 30,
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Demo authentication logic
        if ((email === 'student@neutraledu.com' || email === 'admin@neutraledu.com') && password === 'demo123') {
          const user = demoUsers[email];
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);