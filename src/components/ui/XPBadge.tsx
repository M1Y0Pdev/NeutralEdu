import React from 'react';
import { Trophy, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface XPBadgeProps {
  xp: number;
  level: number;
  streak: number;
  showStreak?: boolean;
}

export const XPBadge: React.FC<XPBadgeProps> = ({ 
  xp, 
  level, 
  streak, 
  showStreak = true 
}) => {
  const xpForNextLevel = (level + 1) * 200;
  const currentLevelXP = xp % 200;
  const progress = (currentLevelXP / 200) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-lg">
        <Trophy size={16} className="text-primary-600 dark:text-primary-400" />
        <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
          Seviye {level}
        </span>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {currentLevelXP}/200 XP
        </span>
      </div>

      {showStreak && (
        <motion.div 
          className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame size={14} className="text-orange-500" />
          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
            {streak}
          </span>
        </motion.div>
      )}
    </div>
  );
};