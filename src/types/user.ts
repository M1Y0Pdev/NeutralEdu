export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
  level?: number;
  xp?: number;
  streak?: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}