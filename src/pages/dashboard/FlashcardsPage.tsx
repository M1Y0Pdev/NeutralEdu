import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Tag, Shuffle, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  tags: string[];
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  lastReviewed?: Date;
  nextReview?: Date;
}

const flashcards: Flashcard[] = [
  {
    id: 1,
    front: "f(x) = x² + 3x + 2 fonksiyonunun türevi nedir?",
    back: "f'(x) = 2x + 3\n\nAçıklama: Polinom türev kuralına göre, x^n teriminin türevi n·x^(n-1) olur.",
    tags: ["Matematik", "Türev", "12. Sınıf"],
    difficulty: "Orta",
    lastReviewed: new Date('2024-01-15'),
    nextReview: new Date('2024-01-20'),
  },
  {
    id: 2,
    front: "Osmanlı İmparatorluğu hangi yılda kuruldu?",
    back: "1299\n\nOsman Gazi tarafından kurulan Osmanlı Beyliği, daha sonra imparatorluğa dönüştü.",
    tags: ["Tarih", "Osmanlı", "11. Sınıf"],
    difficulty: "Kolay",
  },
  {
    id: 3,
    front: "Hücrenin enerji fabrikası olarak adlandırılan organel hangisidir?",
    back: "Mitokondri\n\nMitokondri, hücresel solunumu gerçekleştirerek ATP üretimi yapar.",
    tags: ["Biyoloji", "Hücre", "9. Sınıf"],
    difficulty: "Kolay",
  },
  {
    id: 4,
    front: "İngilizce'de 'Present Perfect Tense' nasıl kurulur?",
    back: "Have/Has + Past Participle\n\nÖrnek: I have studied English for 5 years.",
    tags: ["İngilizce", "Grammar", "10. Sınıf"],
    difficulty: "Orta",
  },
];

export const FlashcardsPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState('Tümü');
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const allTags = ['Tümü', ...Array.from(new Set(flashcards.flatMap(card => card.tags)))];
  
  const filteredCards = selectedTag === 'Tümü' 
    ? flashcards 
    : flashcards.filter(card => card.tags.includes(selectedTag));

  const currentCard = filteredCards[currentCardIndex];

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * filteredCards.length);
    setCurrentCardIndex(randomIndex);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'Orta': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Zor': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  if (studyMode && currentCard) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center space-y-6">
        {/* Study Mode Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Çalışma Modu
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {currentCardIndex + 1} / {filteredCards.length}
          </p>
        </div>

        {/* Flashcard */}
        <motion.div
          className="w-full max-w-2xl h-96 relative perspective-1000"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            className="w-full h-full relative preserve-3d cursor-pointer"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front */}
            <Card className="absolute inset-0 w-full h-full backface-hidden flex flex-col justify-center p-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
              <div className="text-center">
                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                    {currentCard.difficulty}
                  </span>
                </div>
                <p className="text-lg md:text-xl font-medium text-neutral-900 dark:text-white leading-relaxed">
                  {currentCard.front}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                  Cevabı görmek için tıklayın
                </p>
              </div>
            </Card>

            {/* Back */}
            <Card className="absolute inset-0 w-full h-full backface-hidden rotateY-180 flex flex-col justify-center p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="text-center">
                <p className="text-lg md:text-xl font-medium text-neutral-900 dark:text-white leading-relaxed whitespace-pre-line">
                  {currentCard.back}
                </p>
                <div className="mt-6">
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentCard.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handlePrevCard} variant="secondary">
            ← Önceki
          </Button>
          <Button onClick={handleShuffle} icon={Shuffle} variant="ghost">
            Karıştır
          </Button>
          <Button onClick={handleNextCard} variant="secondary">
            Sonraki →
          </Button>
        </div>

        {/* Exit Study Mode */}
        <Button onClick={() => setStudyMode(false)} variant="ghost">
          Çalışma Modundan Çık
        </Button>
      </div>
    );
  }

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
            Kartlarım
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Flashcard'larınızı inceleyin ve çalışma modu ile pratik yapın
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon={Plus} variant="secondary">
            Yeni Kart
          </Button>
          <Button 
            onClick={() => setStudyMode(true)}
            icon={CreditCard}
            disabled={filteredCards.length === 0}
          >
            Çalışma Modu
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <Tag size={18} className="text-primary-600" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Etiketler</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Flashcards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-64 relative overflow-hidden group">
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                      {card.difficulty}
                    </span>
                    <button
                      onClick={() => setShowAnswer(showAnswer === card.id ? null : card.id)}
                      className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      {showAnswer === card.id ? (
                        <EyeOff size={16} className="text-neutral-500" />
                      ) : (
                        <Eye size={16} className="text-neutral-500" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2 line-clamp-3">
                      {card.front}
                    </p>
                    
                    <AnimatePresence>
                      {showAnswer === card.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700"
                        >
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                            {card.back.split('\n')[0]}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {card.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {card.tags.length > 2 && (
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded text-xs">
                          +{card.tags.length - 2}
                        </span>
                      )}
                    </div>
                    
                    {card.nextReview && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Sonraki tekrar: {card.nextReview.toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button size="sm" variant="secondary">
                    Detaylar
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <CreditCard size={48} className="text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Kart Bulunamadı
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Seçtiğiniz etikete uygun kart bulunmuyor. Filtrelerinizi değiştirin veya yeni kart ekleyin.
          </p>
        </motion.div>
      )}
    </div>
  );
};