import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, BookOpen, FileText, AlertTriangle, Upload, BarChart3 } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User } from '../../types/user';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'users', label: 'Kullanıcı Yönetimi', icon: Users },
    { id: 'lessons', label: 'Ders Yönetimi', icon: BookOpen },
    { id: 'quizzes', label: 'Quiz Yönetimi', icon: FileText },
    { id: 'flagged', label: 'Bayraklı İçerik', icon: AlertTriangle },
    { id: 'uploads', label: 'PDF Şablonları', icon: Upload },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as User[];
      
      setUsers(usersList);
    } catch (error) {
      console.error('Kullanıcılar alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: 'Toplam Kullanıcı', value: users.length.toString(), change: '+12%', color: 'text-blue-600' },
    { title: 'Öğrenci Sayısı', value: users.filter(u => u.role === 'student').length.toString(), change: '+15%', color: 'text-green-600' },
    { title: 'Öğretmen Sayısı', value: users.filter(u => u.role === 'teacher').length.toString(), change: '+3%', color: 'text-purple-600' },
    { title: 'Admin Sayısı', value: users.filter(u => u.role === 'admin').length.toString(), change: '0', color: 'text-red-600' },
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
                Son Kayıt Olan Kullanıcılar
              </h3>
              <div className="space-y-3">
                {users
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((user, index) => (
                    <div key={user.uid} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {user.name}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400 ml-2">
                          ({user.email})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          user.role === 'teacher' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                        </span>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </p>
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Kullanıcı Yönetimi
              </h3>
              <Button icon={Users}>
                Yeni Kullanıcı Ekle
              </Button>
            </div>

            <Card className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Kullanıcılar yükleniyor...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
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
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          user.role === 'teacher' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            Seviye {user.level || 1} • {user.xp || 0} XP
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Düzenle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            Admin Dashboard
          </h1>
        </div>
        <p className="text-red-100">
          Platform yönetimi ve kullanıcı kontrolü
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