import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Settings, Play, Download, Shuffle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "f(x) = x² + 3x - 2 fonksiyonunun türevi nedir?",
    options: ["2x + 3", "x² + 3", "2x - 3", "x + 3"],
    correct: 0,
    explanation: "f'(x) = 2x + 3. Polinom türev kuralı: x^n türevi n·x^(n-1) olur."
  },
  {
    id: 2,
    question: "∫(2x + 1)dx integrali nedir?",
    options: ["x² + x + C", "2x² + x + C", "x² + 2x + C", "2x + C"],
    correct: 0,
    explanation: "∫(2x + 1)dx = ∫2x dx + ∫1 dx = x² + x + C"
  },
  {
    id: 3,
    question: "lim(x→0) (sin x / x) limitinin değeri nedir?",
    options: ["0", "1", "∞", "Tanımsız"],
    correct: 1,
    explanation: "Bu önemli bir trigonometrik limittir ve değeri 1'dir."
  }
];

export const TestGeneratorPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('orta');
  const [questionCount, setQuestionCount] = useState(10);
  const [questionType, setQuestionType] = useState('coktan-secmeli');
  const [generatedTest, setGeneratedTest] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGenerateTest = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGeneratedTest(sampleQuestions.slice(0, questionCount));
    setIsGenerating(false);
  };

  const handleStartTest = () => {
    setShowResults(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Test Oluşturucu
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Yapay zeka ile kişiselleştirilmiş testler oluştur
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings size={20} className="text-primary-600" />
              Test Ayarları
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Konu
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Örn: Türev ve Uygulamaları"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Zorluk Seviyesi
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="kolay">Kolay</option>
                  <option value="orta">Orta</option>
                  <option value="zor">Zor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Soru Sayısı: {questionCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Soru Tipi
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="coktan-secmeli">Çoktan Seçmeli</option>
                  <option value="dogru-yanlis">Doğru/Yanlış</option>
                  <option value="bosluk-doldurma">Boşluk Doldurma</option>
                  <option value="eslestime">Eşleştirme</option>
                </select>
              </div>

              <Button
                onClick={handleGenerateTest}
                loading={isGenerating}
                icon={Shuffle}
                className="w-full"
                disabled={!topic}
              >
                Test Oluştur
              </Button>
            </div>

            {generatedTest.length > 0 && (
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex gap-2">
                  <Button
                    onClick={handleStartTest}
                    icon={Play}
                    size="sm"
                    className="flex-1"
                  >
                    Testi Başlat
                  </Button>
                  <Button
                    variant="secondary"
                    icon={Download}
                    size="sm"
                    className="flex-1"
                  >
                    PDF İndir
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Generated Test */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-primary-600" />
              Oluşturulan Test
            </h2>

            {isGenerating ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Test oluşturuluyor...
                </p>
              </div>
            ) : generatedTest.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                    {topic} - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Seviye
                  </h3>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    {generatedTest.length} soru • Tahmini süre: {generatedTest.length * 2} dakika
                  </p>
                </div>

                <div className="space-y-4">
                  {generatedTest.map((question, index) => (
                    <div key={question.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900 dark:text-white mb-3">
                            {question.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options.map((option, optionIndex) => (
                              <label
                                key={optionIndex}
                                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                  showResults && optionIndex === question.correct
                                    ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  className="text-primary-600"
                                  disabled={showResults}
                                />
                                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                  {String.fromCharCode(65 + optionIndex)}) {option}
                                </span>
                              </label>
                            ))}
                          </div>
                          {showResults && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Açıklama:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!showResults && (
                  <div className="text-center pt-4">
                    <Button onClick={handleStartTest} icon={Play}>
                      Testi Tamamla ve İncele
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  Test Oluşturmaya Hazır
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Sol taraftan istediğiniz konuyu seçin ve test oluşturun.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};