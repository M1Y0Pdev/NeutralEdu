import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Star, Play, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  grade: number;
  duration: string;
  students: number;
  rating: number;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  thumbnail: string;
  progress?: number;
}

const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Türev ve Uygulamaları',
    subject: 'Matematik',
    grade: 12,
    duration: '45 dk',
    students: 1234,
    rating: 4.8,
    difficulty: 'Zor',
    thumbnail: 'https://images.pexels.com/photos/6238118/pexels-photo-6238118.jpeg?auto=compress&cs=tinysrgb&w=400',
    progress: 75,
  },
  {
    id: 2,
    title: 'Osmanlı İmparatorluğu',
    subject: 'Tarih',
    grade: 11,
    duration: '60 dk',
    students: 987,
    rating: 4.6,
    difficulty: 'Orta',
    thumbnail: 'https://images.pexels.com/photos/356830/pexels-photo-356830.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 3,
    title: 'Hücre Biyolojisi',
    subject: 'Biyoloji',
    grade: 9,
    duration: '50 dk',
    students: 756,
    rating: 4.7,
    difficulty: 'Orta',
    thumbnail: 'https://images.pexels.com/photos/5220074/pexels-photo-5220074.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 4,
    title: 'İngilizce Grammar',
    subject: 'İngilizce',
    grade: 10,
    duration: '40 dk',
    students: 2341,
    rating: 4.9,
    difficulty: 'Kolay',
    thumbnail: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=400',
    progress: 30,
  },
  {
    id: 5,
    title: 'Fizik Kanunları',
    subject: 'Fizik',
    grade: 11,
    duration: '55 dk',
    students: 654,
    rating: 4.5,
    difficulty: 'Zor',
    thumbnail: 'https://images.pexels.com/photos/355948/pexels-photo-355948.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 6,
    title: 'Kimyasal Bağlar',
    subject: 'Kimya',
    grade: 9,
    duration: '45 dk',
    students: 432,
    rating: 4.4,
    difficulty: 'Orta',
    thumbnail: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const subjects = ['Tümü', 'Matematik', 'Türkçe', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'İngilizce'];
const grades = ['Tümü', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'];

export const LessonsPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('Tümü');
  const [selectedGrade, setSelectedGrade] = useState('Tümü');

  const filteredLessons = lessons.filter(lesson => {
    const subjectMatch = selectedSubject === 'Tümü' || lesson.subject === selectedSubject;
    const gradeMatch = selectedGrade === 'Tümü' || lesson.grade.toString() === selectedGrade.split('.')[0];
    return subjectMatch && gradeMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'Orta': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Zor': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

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
            Derslerim
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Konularına göre kategorize edilmiş dersleri keşfet
          </p>
        </div>
        <Button icon={Filter} variant="secondary">
          Filtrele
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <Card className="p-4 lg:w-1/3">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Ders</h3>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedSubject === subject
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4 lg:w-1/3">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Sınıf</h3>
          <div className="flex flex-wrap gap-2">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedGrade === grade
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Lessons Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredLessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card hover className="overflow-hidden group">
              <div className="relative">
                <img
                  src={lesson.thumbnail}
                  alt={lesson.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                    {lesson.difficulty}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button icon={Play} className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
                    Başla
                  </Button>
                </div>
                {lesson.progress && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div 
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${lesson.progress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    {lesson.subject} • {lesson.grade}. Sınıf
                  </span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {lesson.rating}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 line-clamp-2">
                  {lesson.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {lesson.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {lesson.students.toLocaleString()}
                  </div>
                </div>

                {lesson.progress && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">İlerleme</span>
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        %{lesson.progress}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen size={48} className="text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Ders Bulunamadı
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Seçtiğiniz filtrelere uygun ders bulunmuyor. Filtreleri değiştirmeyi deneyin.
          </p>
        </motion.div>
      )}
    </div>
  );
};