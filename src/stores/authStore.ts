import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Firestore'dan kullanıcı bilgilerini al
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            set({ 
              user: userData, 
              isAuthenticated: true, 
              loading: false 
            });
            return true;
          } else {
            console.error('Kullanıcı verisi bulunamadı');
            return false;
          }
        } catch (error) {
          console.error('Giriş hatası:', error);
          set({ loading: false });
          return false;
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Yeni kullanıcı verilerini oluştur
          const newUser: User = {
            uid: firebaseUser.uid,
            name,
            email,
            role: 'student',
            createdAt: new Date(),
            level: 1,
            xp: 0,
            streak: 0,
          };
          
          // Firestore'a kullanıcı bilgilerini kaydet
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            loading: false 
          });
          return true;
        } catch (error) {
          console.error('Kayıt hatası:', error);
          set({ loading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false 
          });
        } catch (error) {
          console.error('Çıkış hatası:', error);
        }
      },

      initializeAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              
              if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                set({ 
                  user: userData, 
                  isAuthenticated: true, 
                  loading: false 
                });
              } else {
                // Kullanıcı verisi yoksa çıkış yap
                await signOut(auth);
                set({ 
                  user: null, 
                  isAuthenticated: false, 
                  loading: false 
                });
              }
            } catch (error) {
              console.error('Kullanıcı verisi alınamadı:', error);
              set({ 
                user: null, 
                isAuthenticated: false, 
                loading: false 
              });
            }
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              loading: false 
            });
          }
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);