import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, BookOpen, FileText, AlertTriangle, Upload, BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'lessons', label: 'Ders Yönetimi', icon: BookOpen },
    { id: 'quizzes', label: 'Quiz Yönetimi', icon: FileText },
    { id: 'users', label: 'Kullanıcı Raporları', icon: Users },
    { id: 'flagged', label: 'Bayraklı İçerik', icon: AlertTriangle },
    { id: 'uploads', label: 'PDF Şablonları', icon: Upload },
  ];

  const stats = [
    { title: 'Toplam Kullanıcı', value: '1,234', change: '+12%', color: 'text-blue-600' },
    { title: 'Aktif Dersler', value: '89', change: '+5%', color: 'text-green-600' },
    { title: 'Çözülen Sorular', value: '45,678', change: '+23%', color: 'text-purple-600' },
    { title: 'Bayraklı İçerik', value: '3', change: '-2', color: 'text-red-600' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={stat.title} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${stat.color}`}>
                      {stat.change}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Son Aktiviteler
              </h3>
              <div className="space-y-3">
                {[
                  { user: 'Ahmet Y.', action: 'Yeni ders tamamladı', time: '5 dk önce' },
                  { user: 'Ayşe D.', action: 'Test oluşturdu', time: '12 dk önce' },
                  { user: 'Mehmet K.', action: 'PDF özetledi', time: '25 dk önce' },
                  { user: 'Fatma Ö.', action: 'Flashcard oluşturdu', time: '1 saat önce' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {activity.user}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400 ml-2">
                        {activity.action}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'lessons':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Ders Yönetimi
              </h3>
              <Button icon={BookOpen}>
                Yeni Ders Ekle
              </Button>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                {[
                  { title: 'Matematik - Türev', grade: '12. Sınıf', status: 'Aktif', students: 234 },
                  { title: 'Fizik - Hareket', grade: '11. Sınıf', status: 'Aktif', students: 189 },
                  { title: 'Tarih - Osmanlı', grade: '10. Sınıf', status: 'Taslak', students: 0 },
                  { title: 'İngilizce - Grammar', grade: '9. Sınıf', status: 'Aktif', students: 156 },
                ].map((lesson, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">
                        {lesson.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {lesson.grade} • {lesson.students} öğrenci
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lesson.status === 'Aktif' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {lesson.status}
                      </span>
                      <Button variant="ghost" size="sm">
                        Düzenle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Kullanıcı Raporları
            </h3>

            <Card className="p-6">
              <div className="space-y-4">
                {[
                  { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', level: 12, xp: 2450, lastActive: '2 saat önce' },
                  { name: 'Ayşe Demir', email: 'ayse@example.com', level: 8, xp: 1680, lastActive: '1 gün önce' },
                  { name: 'Mehmet Kaya', email: 'mehmet@example.com', level: 15, xp: 3200, lastActive: '5 dk önce' },
                  { name: 'Fatma Özkan', email: 'fatma@example.com', level: 6, xp: 1200, lastActive: '3 gün önce' },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">
                          {user.name}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        Seviye {user.level} • {user.xp} XP
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {user.lastActive}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Bu bölüm henüz hazır değil
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Yakında bu özellik eklenecek.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} />
          <h1 className="text-2xl font-bold">
            Admin Panel
          </h1>
        </div>
        <p className="text-red-100">
          Platform yönetimi ve içerik kontrolü
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="p-6">
            {renderTabContent()}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};