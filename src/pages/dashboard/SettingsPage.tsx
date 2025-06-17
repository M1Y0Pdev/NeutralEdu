import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useAuthStore } from '../../stores/authStore';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: {
      email: true,
      push: false,
      study: true,
      achievements: true,
    },
    privacy: {
      profileVisible: true,
      showProgress: false,
      allowMessages: true,
    },
    preferences: {
      language: 'tr',
      timezone: 'Europe/Istanbul',
      studyReminders: true,
      autoSave: true,
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'privacy', label: 'Gizlilik', icon: Shield },
    { id: 'preferences', label: 'Tercihler', icon: Settings },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
  ];

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Simulate save operation
    console.log('Settings saved:', formData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Profil Fotoğrafı
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                  <User size={24} className="text-primary-600 dark:text-primary-400" />
                </div>
                <Button variant="secondary" size="sm">
                  Fotoğraf Değiştir
                </Button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Bildirim Tercihleri
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'E-posta Bildirimleri', desc: 'Önemli güncellemeler için e-posta al' },
                  { key: 'push', label: 'Push Bildirimleri', desc: 'Tarayıcı bildirimleri' },
                  { key: 'study', label: 'Çalışma Hatırlatıcıları', desc: 'Günlük çalışma hedeflerin için hatırlatıcı' },
                  { key: 'achievements', label: 'Başarı Bildirimleri', desc: 'Yeni rozet ve seviye atlama bildirimleri' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">
                        {item.label}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications[item.key]}
                        onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Gizlilik Ayarları
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'profileVisible', label: 'Profil Görünürlüğü', desc: 'Profilin diğer kullanıcılar tarafından görülsün' },
                  { key: 'showProgress', label: 'İlerleme Paylaşımı', desc: 'Çalışma ilerlemen liderlik tablosunda görünsün' },
                  { key: 'allowMessages', label: 'Mesaj Alma', desc: 'Diğer kullanıcılardan mesaj almaya izin ver' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">
                        {item.label}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.privacy[item.key]}
                        onChange={(e) => handleInputChange('privacy', item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Dil
              </label>
              <select
                value={formData.preferences.language}
                onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Saat Dilimi
              </label>
              <select
                value={formData.preferences.timezone}
                onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              >
                <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                <option value="Europe/London">Londra (UTC+0)</option>
                <option value="America/New_York">New York (UTC-5)</option>
              </select>
            </div>

            <div className="space-y-4">
              {[
                { key: 'studyReminders', label: 'Çalışma Hatırlatıcıları', desc: 'Günlük çalışma hedeflerin için hatırlatıcı al' },
                { key: 'autoSave', label: 'Otomatik Kaydetme', desc: 'İlerlemen otomatik olarak kaydedilsin' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-white">
                      {item.label}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {item.desc}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferences[item.key]}
                      onChange={(e) => handleInputChange('preferences', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Tema Ayarları
              </h3>
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">
                    Karanlık Mod
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Arayüzü karanlık tema ile kullan
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Renk Teması
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: 'Mor', color: 'bg-purple-500', active: true },
                  { name: 'Mavi', color: 'bg-blue-500', active: false },
                  { name: 'Yeşil', color: 'bg-green-500', active: false },
                  { name: 'Turuncu', color: 'bg-orange-500', active: false },
                ].map((theme) => (
                  <button
                    key={theme.name}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      theme.active 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className={`w-8 h-8 ${theme.color} rounded-full mx-auto mb-2`} />
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Ayarlar
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Hesap ayarlarınızı ve tercihlerinizi yönetin
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
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <Button onClick={handleSave} icon={Save}>
                Kaydet
              </Button>
            </div>

            {renderTabContent()}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};