import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Clock, Award, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const studyData = [
  { day: 'Pzt', matematik: 120, fizik: 90, tarih: 60, toplam: 270 },
  { day: 'Sal', matematik: 90, fizik: 120, tarih: 45, toplam: 255 },
  { day: 'Çar', matematik: 150, fizik: 60, tarih: 90, toplam: 300 },
  { day: 'Per', matematik: 110, fizik: 100, tarih: 30, toplam: 240 },
  { day: 'Cum', matematik: 130, fizik: 80, tarih: 75, toplam: 285 },
  { day: 'Cmt', matematik: 60, fizik: 40, tarih: 120, toplam: 220 },
  { day: 'Paz', matematik: 80, fizik: 70, tarih: 100, toplam: 250 },
];

const subjectProgress = [
  { subject: 'Matematik', progress: 85, color: '#3B82F6' },
  { subject: 'Fizik', progress: 72, color: '#8B5CF6' },
  { subject: 'Kimya', progress: 68, color: '#EF4444' },
  { subject: 'Biyoloji', progress: 79, color: '#10B981' },
  { subject: 'Tarih', progress: 91, color: '#F97316' },
  { subject: 'Coğrafya', progress: 64, color: '#06B6D4' },
];

const performanceData = [
  { name: 'Doğru', value: 78, color: '#10B981' },
  { name: 'Yanlış', value: 15, color: '#EF4444' },
  { name: 'Boş', value: 7, color: '#6B7280' },
];

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Analizler
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Çalışma performansınızı takip edin ve gelişiminizi izleyin
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Bu Hafta Toplam', value: '18.5 saat', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { title: 'Çözülen Soru', value: '324', icon: Target, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { title: 'Ortalama Başarı', value: '%78', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { title: 'Çalışma Serisi', value: '12 gün', icon: Award, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
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
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Time Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-primary-600" />
              Haftalık Çalışma Süresi
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="matematik" fill="#3B82F6" name="Matematik" />
                  <Bar dataKey="fizik" fill="#8B5CF6" name="Fizik" />
                  <Bar dataKey="tarih" fill="#F97316" name="Tarih" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Performance Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-primary-600" />
              Soru Performansı
            </h2>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <Pie>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </Pie>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {performanceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {item.name}: %{item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Subject Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-600" />
            Ders Bazında İlerleme
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectProgress.map((subject, index) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {subject.subject}
                  </h3>
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    %{subject.progress}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: subject.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.progress}%` }}
                    transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Başlangıç</span>
                  <span>Hedef</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Study Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary-600" />
            Çalışma Takvimi
          </h2>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const intensity = Math.random();
              let bgColor = 'bg-neutral-100 dark:bg-neutral-800';
              
              if (intensity > 0.7) bgColor = 'bg-green-500';
              else if (intensity > 0.5) bgColor = 'bg-green-400';
              else if (intensity > 0.3) bgColor = 'bg-green-300';
              else if (intensity > 0.1) bgColor = 'bg-green-200';

              return (
                <div
                  key={i}
                  className={`aspect-square rounded ${bgColor} hover:scale-110 transition-transform cursor-pointer`}
                  title={`${Math.round(intensity * 120)} dakika çalışma`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            <span>Az</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="w-3 h-3 bg-green-200 rounded" />
              <div className="w-3 h-3 bg-green-300 rounded" />
              <div className="w-3 h-3 bg-green-400 rounded" />
              <div className="w-3 h-3 bg-green-500 rounded" />
            </div>
            <span>Çok</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};