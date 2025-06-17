import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Upload, FileText, Download, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SummarizerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState('');
  const [originalText, setOriginalText] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  const handleSummarize = async () => {
    if (!file) return;

    setIsProcessing(true);
    
    // Simulate PDF processing and summarization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const sampleOriginalText = `
Türev, matematikte bir fonksiyonun belirli bir noktadaki değişim hızını ölçen önemli bir kavramdır. 
Türev kavramı, 17. yüzyılda Isaac Newton ve Gottfried Wilhelm Leibniz tarafından bağımsız olarak geliştirilmiştir.

Bir f(x) fonksiyonunun x=a noktasındaki türevi, o noktadaki teğet doğrunun eğimi olarak tanımlanır.
Matematiksel olarak, f'(a) = lim(h→0) [f(a+h) - f(a)]/h şeklinde ifade edilir.

Türev almak için çeşitli kurallar vardır:
1. Güç kuralı: (x^n)' = n·x^(n-1)
2. Toplam kuralı: (f+g)' = f' + g'
3. Çarpım kuralı: (f·g)' = f'·g + f·g'
4. Bölüm kuralı: (f/g)' = (f'·g - f·g')/g²

Türevler, fizik, mühendislik, ekonomi ve birçok alanda uygulanır. Özellikle hız, ivme, optimizasyon 
problemleri ve eğri çizimi gibi konularda kritik öneme sahiptir.
    `;

    const sampleSummary = `
🎯 TÜREV KONUSU ÖZETİ

📖 TANIM:
• Türev = Fonksiyonun değişim hızı
• Teğet doğrunun eğimi
• f'(a) = lim(h→0) [f(a+h) - f(a)]/h

👥 TARİHÇE:
• Newton ve Leibniz (17. yy)
• Bağımsız geliştirme

🔧 TEMEL KURALLAR:
1️⃣ Güç: (x^n)' = n·x^(n-1)
2️⃣ Toplam: (f+g)' = f' + g'
3️⃣ Çarpım: (f·g)' = f'·g + f·g'
4️⃣ Bölüm: (f/g)' = (f'·g - f·g')/g²

💡 UYGULAMA ALANLARI:
• Fizik (hız, ivme)
• Mühendislik
• Ekonomi
• Optimizasyon
• Eğri analizi

✨ ANAHTAR KELIMELER: Değişim hızı, Teğet, Limit, Kurallar, Uygulama
    `;

    setOriginalText(sampleOriginalText);
    setSummary(sampleSummary);
    setIsProcessing(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
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
          PDF Özetleyici
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          PDF dosyalarınızı yükleyin ve yapay zeka ile özetleyin
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Upload size={20} className="text-primary-600" />
              PDF Yükle
            </h2>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-8 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
            >
              <FileText size={48} className="text-neutral-400 mx-auto mb-4" />
              
              {file ? (
                <div>
                  <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                    {file.name}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    onClick={handleSummarize}
                    loading={isProcessing}
                    icon={Sparkles}
                    className="mb-2"
                  >
                    Özetle
                  </Button>
                  <br />
                  <Button
                    onClick={() => setFile(null)}
                    variant="ghost"
                    size="sm"
                  >
                    Farklı dosya seç
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
                    PDF dosyanızı buraya sürükleyin veya seçin
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button as="span" icon={Upload}>
                      Dosya Seç
                    </Button>
                  </label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Maksimum dosya boyutu: 10MB
                  </p>
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="font-medium text-primary-900 dark:text-primary-100">
                      PDF işleniyor...
                    </p>
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      Metin çıkarılıyor ve özet hazırlanıyor
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <FileSearch size={20} className="text-primary-600" />
              Özet
            </h2>

            {summary ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                  <pre className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {summary}
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <Button icon={Download} size="sm" variant="secondary">
                    Özet İndir
                  </Button>
                  <Button size="sm" variant="ghost">
                    Flashcard Oluştur
                  </Button>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                    Orijinal metni göster
                  </summary>
                  <div className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg max-h-60 overflow-y-auto">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {originalText}
                    </p>
                  </div>
                </details>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileSearch size={48} className="text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  Özet Hazır Değil
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  PDF dosyanızı yükleyin ve özetleme işlemini başlatın.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            Özellikler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Akıllı Özet',
                description: 'Yapay zeka ile anahtar noktaları çıkarır',
                icon: '🤖',
              },
              {
                title: 'Hızlı İşleme',
                description: 'Saniyeler içinde özet hazırlar',
                icon: '⚡',
              },
              {
                title: 'Çoklu Format',
                description: 'PDF, DOCX ve TXT dosyalarını destekler',
                icon: '📄',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};