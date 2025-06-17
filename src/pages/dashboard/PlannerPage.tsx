import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, BookOpen, Target } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface StudyTask {
  id: number;
  title: string;
  subject: string;
  duration: number;
  completed: boolean;
  priority: 'Yüksek' | 'Orta' | 'Düşük';
  date: string;
  time: string;
}

const studyTasks: StudyTask[] = [
  {
    id: 1,
    title: 'Matematik - Türev Problemleri',
    subject: 'Matematik',
    duration: 60,
    completed: true,
    priority: 'Yüksek',
    date: '2024-01-15',
    time: '14:00',
  },
  {
    id: 2,
    title: 'Fizik - Hareket Yasaları',
    subject: 'Fizik',
    duration: 45,
    completed: false,
    priority: 'Orta',
    date: '2024-01-15',
    time: '16:00',
  },
  {
    id: 3,
    title: 'Tarih - Osmanlı Dönemi',
    subject: 'Tarih',
    duration: 30,
    completed: false,
    priority: 'Düşük',
    date: '2024-01-16',
    time: '10:00',
  },
  {
    id: 4,
    title: 'İngilizce - Grammar Quiz',
    subject: 'İngilizce',
    duration: 25,
    completed: false,
    priority: 'Orta',
    date: '2024-01-16',
    time: '15:30',
  },
];

const weekDays = [
  'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'
];

export const PlannerPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2024-01-15');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Yüksek': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'Orta': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Düşük': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Matematik': 'bg-blue-500',
      'Fizik': 'bg-purple-500',
      'Tarih': 'bg-orange-500',
      'İngilizce': 'bg-green-500',
      'Kimya': 'bg-red-500',
      'Biyoloji': 'bg-teal-500',
    };
    return colors[subject] || 'bg-neutral-500';
  };

  const tasksForDate = (date: string) => studyTasks.filter(task => task.date === date);
  const todayTasks = tasksForDate(selectedDate);
  const completedTasks = todayTasks.filter(task => task.completed).length;
  const totalDuration = todayTasks.reduce((acc, task) => acc + task.duration, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Çalışma Planlayıcı
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Çalışma programınızı organize edin ve takip edin
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'week' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Haftalık
          </Button>
          <Button
            variant={viewMode === 'day' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Günlük
          </Button>
          <Button icon={Plus} variant="primary">
            Görev Ekle
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Bugünkü Görevler', value: todayTasks.length, icon: Target, color: 'text-blue-600' },
          { title: 'Tamamlanan', value: completedTasks, icon: BookOpen, color: 'text-green-600' },
          { title: 'Toplam Süre', value: `${totalDuration} dk`, icon: Clock, color: 'text-purple-600' },
          { title: 'Başarı Oranı', value: `%${Math.round((completedTasks / todayTasks.length) * 100) || 0}`, icon: Calendar, color: 'text-orange-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="p-4">
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
        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary-600" />
              Haftalık Görünüm
            </h2>

            <div className="space-y-4">
              {weekDays.map((day, index) => {
                const currentDate = `2024-01-${15 + index}`;
                const dayTasks = tasksForDate(currentDate);
                const isSelected = currentDate === selectedDate;

                return (
                  <div
                    key={day}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                    onClick={() => setSelectedDate(currentDate)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {day}
                      </h3>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(currentDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    {dayTasks.length > 0 ? (
                      <div className="space-y-2">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className={`w-3 h-3 rounded-full ${getSubjectColor(task.subject)}`} />
                            <span className={`flex-1 ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
                              {task.time} - {task.title}
                            </span>
                            <span className="text-neutral-500 dark:text-neutral-400">
                              {task.duration}dk
                            </span>
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            +{dayTasks.length - 3} görev daha
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 dark:text-neutral-500">
                        Görev planlanmamış
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Task Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              {new Date(selectedDate).toLocaleDateString('tr-TR', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </h2>

            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      task.completed
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          className="text-primary-600 rounded"
                          readOnly
                        />
                        <span className={`font-medium ${
                          task.completed 
                            ? 'text-green-700 dark:text-green-300 line-through' 
                            : 'text-neutral-900 dark:text-white'
                        }`}>
                          {task.title}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {task.time}
                      </span>
                      <span>
                        {task.duration} dakika
                      </span>
                      <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getSubjectColor(task.subject)}`} />
                        {task.subject}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  Görev Yok
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Bu gün için henüz görev planlanmamış.
                </p>
                <Button icon={Plus} size="sm">
                  Görev Ekle
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};