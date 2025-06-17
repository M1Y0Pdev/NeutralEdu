import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Target, Zap, Star, Crown, Medal, Gift } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { XPBadge } from '../../components/ui/XPBadge';
import { useAuthStore } from '../../stores/authStore';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate?: Date;
}

interface Mission {
  id: number;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  type: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
}

const badges: Badge[] = [
  {
    id: 1,
    name: 'İlk Adım',
    description: 'İlk dersini tamamladın',
    icon: '🎯',
    earned: true,
    rarity: 'common',
    earnedDate: new Date('2024-01-10'),
  },
  {
    id: 2,
    name: 'Matematik Ustası',
    description: '100 matematik sorusu çöz',
    icon: '🧮',
    earned: true,
    rarity: 'rare',
    earnedDate: new Date('2024-01-12'),
  },
  {
    id: 3,
    name: 'Çalışma Canavarı',
    description: '7 gün üst üste çalış',
    icon: '🔥',
    earned: true,
    rarity: 'epic',
    earnedDate: new Date('2024-01-14'),
  },
  {
    id: 4,
    name: 'Mükemmeliyetçi',
    description: '10 test %100 başarı ile tamamla',
    icon: '💎',
    earned: false,
    rarity: 'legendary',
  },
  {
    id: 5,
    name: 'Hızlı Öğrenci',
    description: '1 saatte 50 soru çöz',
    icon: '⚡',
    earned: true,
    rarity: 'rare',
    earnedDate: new Date('2024-01-13'),
  },
  {
    id: 6,
    name: 'Bilgi Avcısı',
    description: '500 flashcard incele',
    icon: '🎴',
    earned: false,
    rarity: 'epic',
  },
];

const missions: Mission[] = [
  {
    id: 1,
    title: 'Günlük Çalışma',
    description: 'Bugün 30 dakika çalış',
    progress: 25,
    target: 30,
    reward: 50,
    type: 'daily',
    completed: false,
  },
  {
    id: 2,
    title: 'Soru Çözme',
    description: '20 soru çöz',
    progress: 20,
    target: 20,
    reward: 100,
    type: 'daily',
    completed: true,
  },
  {
    id: 3,
    title: 'Haftalık Hedef',
    description: 'Bu hafta 5 saat çalış',
    progress: 3.5,
    target: 5,
    reward: 300,
    type: 'weekly',
    completed: false,
  },
  {
    id: 4,
    title: 'Test Ustası',
    description: '3 test tamamla',
    progress: 1,
    target: 3,
    reward: 150,
    type: 'weekly',
    completed: false,
  },
];

export const GamificationPage: React.FC = () => {
  const { user } = useAuthStore();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800';
      case 'rare': return 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20';
      case 'epic': return 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20';
      case 'legendary': return 'border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20';
      default: return 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800';
    }
  };

  const getMissionTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'weekly': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'monthly': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);
  const activeMissions = missions.filter(mission => !mission.completed);
  const completedMissions = missions.filter(mission => mission.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Seviyeler & Başarılar
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          İlerlemeni takip et, rozetler kazan ve seviye atla!
        </p>
      </motion.div>

      {/* Level & XP Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">
                Seviye {user?.level}
              </h2>
              <p className="text-primary-100 mb-4">
                Bir sonraki seviyeye {200 - (user?.xp % 200)} XP kaldı!
              </p>
              {user && (
                <XPBadge 
                  xp={user.xp} 
                  level={user.level} 
                  streak={user.streak}
                  showStreak={true}
                />
              )}
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Crown size={40} className="text-yellow-300" />
              </div>
              <p className="text-sm text-primary-100">
                Toplam XP: {user?.xp.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Missions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-primary-600" />
              Günlük Görevler
            </h2>
            
            <div className="space-y-4">
              {activeMissions.map((mission) => (
                <div key={mission.id} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {mission.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMissionTypeColor(mission.type)}`}>
                        {mission.type === 'daily' ? 'Günlük' : mission.type === 'weekly' ? 'Haftalık' : 'Aylık'}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star size={14} />
                        <span className="text-sm font-medium">{mission.reward}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {mission.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">İlerleme</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {mission.progress}/{mission.target}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <motion.div
                        className="h-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(mission.progress / mission.target) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {completedMissions.length > 0 && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                    <Award size={16} />
                    Tamamlanan Görevler
                  </h3>
                  {completedMissions.map((mission) => (
                    <div key={mission.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-700 dark:text-green-300">
                          {mission.title}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star size={14} />
                          <span className="text-sm font-medium">+{mission.reward}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Medal size={20} className="text-primary-600" />
              Rozetler ({earnedBadges.length}/{badges.length})
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                  Kazanılan Rozetler
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {earnedBadges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + badge.id * 0.1 }}
                      className={`p-3 rounded-lg border-2 ${getRarityColor(badge.rarity)}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{badge.icon}</div>
                        <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {badge.description}
                        </p>
                        {badge.earnedDate && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {badge.earnedDate.toLocaleDateString('tr-TR')}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                  Kazanılacak Rozetler
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {availableBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-lg border-2 opacity-50 ${getRarityColor(badge.rarity)}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2 grayscale">{badge.icon}</div>
                        <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Leaderboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Trophy size={20} className="text-primary-600" />
              Bu Haftanın Liderleri
            </h2>
            <Button variant="ghost" size="sm">
              Tümünü Gör
            </Button>
          </div>
          
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Ahmet Yılmaz', xp: 2450, avatar: '👨‍🎓' },
              { rank: 2, name: 'Ayşe Demir', xp: 2380, avatar: '👩‍🎓' },
              { rank: 3, name: 'Mehmet Kaya', xp: 2250, avatar: '👨‍💻' },
              { rank: 4, name: 'Fatma Özkan', xp: 2100, avatar: '👩‍💼' },
              { rank: 5, name: 'Sen', xp: user?.xp || 0, avatar: '🎯' },
            ].map((player) => (
              <div
                key={player.rank}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  player.name === 'Sen' 
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
                    : 'bg-neutral-50 dark:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    player.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    player.rank === 2 ? 'bg-gray-100 text-gray-800' :
                    player.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
                  }`}>
                    {player.rank}
                  </span>
                  <span className="text-2xl">{player.avatar}</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {player.name}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {player.xp.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};