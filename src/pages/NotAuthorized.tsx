import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotAuthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-red-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
          <Shield size={32} className="text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          Yetkisiz Erişim
        </h1>
        
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
          Bu sayfaya erişim yetkiniz bulunmuyor. Admin yetkilerine sahip olmanız gerekiyor.
        </p>
        
        <Link to="/dashboard">
          <Button icon={ArrowLeft}>
            Ana Sayfaya Dön
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};