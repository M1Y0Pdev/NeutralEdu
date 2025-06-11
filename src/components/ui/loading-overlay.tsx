"use client";

import { useEffect, useState } from "react";
import { Loader2, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingOverlay() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Yapay zeka öğrenciyi analiz ediyor...");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      // Rastgele loading mesajları
      const messages = [
        "Yapay zeka öğrenciyi analiz ediyor...",
        "Öğrenme süreciniz optimize ediliyor...",
        "Akıllı içerik hazırlanıyor...",
        "Kişiselleştirilmiş deneyim oluşturuluyor...",
        "Öğrenme yolculuğunuz planlanıyor..."
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setLoadingText(randomMessage);
    };

    const handleStop = () => {
      setLoading(false);
    };

    // Sayfa değişikliklerini izle
    handleStart();
    const timeout = setTimeout(handleStop, 1000); // En az 1 saniye göster

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]); // pathname veya searchParams değiştiğinde tetikle

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Brain className="h-12 w-12 text-primary animate-pulse" />
              <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 text-primary animate-spin" />
            </div>
            <p className="text-lg font-medium text-foreground">{loadingText}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 