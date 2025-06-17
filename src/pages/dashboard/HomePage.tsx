import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  Calendar, 
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { XPBadge } from '../../components/ui/XPBadge';
import { useAuthStore } from '../../stores/authStore';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  const todayTasks = [
    { id: 1, title: 'Matematik - Türev Konusu', completed: true, time: '45 dk' },
    { id: 2, title: 'Türkçe - Metin Analizi', completed: false, time: '30 dk' },
    { id: 3, title: 'Fizik - Hareket Yasaları', completed: false, time: '60 dk' },
  ];

  const achievements = [
    { title: '7 Günlük Seri', description: 'Kesintisiz çalışma', icon: Award, color: 'text-yellow-500' },
    { title: 'Test Ustası', description: '50 test tamamlandı', icon: Target, color: 'text-blue-500' },
    { title: 'Matematik Kahramanı', description: 'Matematik seviyesi 15', icon: TrendingUp, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Tekrar hoş geldin, {user?.name}! 👋
          </h1>
          <p className="text-primary-100 text-lg mb-4">
            Bugün harika bir çalışma günü olacak!
          </p>
          {user && (
            <XPBadge 
              xp={user.xp} 
              level={user.level} 
              streak={user.streak}
              showStreak={true}
            />
          )}
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Toplam XP', value: user?.xp.toLocaleString() || '0', icon: Award, color: 'text-yellow-500' },
          { title: 'Seviye', value: user?.level.toString() || '0', icon: TrendingUp, color: 'text-green-500' },
          { title: 'Çalışma Serisi', value: `${user?.streak} gün` || '0 gün', icon: Calendar, color: 'text-blue-500' },
          { title: 'Bu Hafta', value: '12 saat', icon: Clock, color: 'text-purple-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <stat.icon size={24} className={stat.color} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <BookOpen size={20} className="text-primary-600" />
                Bugünkü Görevlerin
              </h2>
              <Button variant="ghost" size="sm">
                Tümünü Gör
                <ArrowRight size={16} />
              </Button>
            </div>
            
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    task.completed
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700'
                  }`}
                >
                  <CheckCircle 
                    size={20} 
                    className={task.completed ? 'text-green-500' : 'text-neutral-400'} 
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${
                      task.completed 
                        ? 'text-green-700 dark:text-green-300 line-through' 
                        : 'text-neutral-900 dark:text-white'
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {task.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-primary-600" />
              Başarılarım
            </h2>
            
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <achievement.icon size={20} className={achievement.color} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {achievement.title}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Test Oluştur', desc: 'Hızlı test çöz', path: '/test-generator' },
              { title: 'Ders Çalış', desc: 'Konulara devam et', path: '/lessons' },
              { title: 'Kartlarını Gözden Geçir', desc: 'Flashcard çalış', path: '/flashcards' },
              { title: 'Plan Yap', desc: 'Çalışma programı', path: '/planner' },
            ].map((action) => (
              <Card key={action.title} hover className="p-4 text-center">
                <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {action.desc}
                </p>
              </Card>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};