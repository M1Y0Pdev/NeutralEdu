import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  FileText,
  CreditCard,
  FileSearch,
  Calendar,
  BarChart3,
  Trophy,
  Settings,
  LogOut,
  X,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { icon: Home, label: 'Ana Sayfa', path: '/dashboard' },
  { icon: BookOpen, label: 'Derslerim', path: '/lessons' },
  { icon: FileText, label: 'Test Oluşturucu', path: '/test-generator' },
  { icon: CreditCard, label: 'Kartlarım', path: '/flashcards' },
  { icon: FileSearch, label: 'PDF Özetleyici', path: '/summarizer' },
  { icon: Calendar, label: 'Çalışma Planlayıcı', path: '/planner' },
  { icon: BarChart3, label: 'Analizler', path: '/analytics' },
  { icon: Trophy, label: 'Seviyeler', path: '/gamification' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-neutral-900 shadow-xl border-r border-neutral-200 dark:border-neutral-700 lg:relative lg:translate-x-0"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Neutral Edu
                  </h1>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden"
                >
                  <X size={20} className="text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}

                {user?.role === 'admin' && (
                  <>
                    <div className="border-t border-neutral-200 dark:border-neutral-700 my-4" />
                    <NavLink
                      to="/admin"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                        }`
                      }
                    >
                      <Shield size={18} />
                      Admin Panel
                    </NavLink>
                  </>
                )}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                <NavLink
                  to="/settings"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                    }`
                  }
                >
                  <Settings size={18} />
                  Ayarlar
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <LogOut size={18} />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};