import React from 'react';
import { Menu, User } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { XPBadge } from '../ui/XPBadge';
import { useAuthStore } from '../../stores/authStore';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 lg:hidden"
          >
            <Menu size={20} className="text-neutral-600 dark:text-neutral-400" />
          </button>
          
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Hoş geldin, {user?.name}!
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:block">
              <XPBadge xp={user.xp} level={user.level} streak={user.streak} />
            </div>
          )}
          
          <ThemeToggle />
          
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
              <User size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hidden sm:block">
              {user?.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};