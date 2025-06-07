
'use server';
/**
 * @fileOverview Öğrencilerin YKS sınav raporlarını analiz eden, zayıf oldukları konuları belirleyen
 * ve kişiselleştirilmiş çalışma önerileri sunan bir AI aracı.
 *
 * - analyzeExamReport - Sınav raporu analiz işlemini yöneten fonksiyon.
 * - ExamReportAnalyzerInput - analyzeExamReport fonksiyonu için giriş tipi.
 * - ExamReportAnalyzerOutput - analyzeExamReport fonksiyonu için dönüş tipi.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UserProfile } from '@/types';

const GENERIC_USER_ERROR_MESSAGE = "Sunucu yoğun olabilir veya beklenmedik bir hata oluştu. Lütfen biraz sonra tekrar deneyin veya farklı bir girdi kullanmayı deneyin.";

const ExamReportAnalyzerInputSchema = z.object({
  reportTextContent: z.string().min(100).describe('Analiz edilecek sınav raporundan çıkarılmış en az 100 karakterlik metin içeriği. Bu metin dersleri, konuları, doğru/yanlış/boş sayılarını veya puanları içermelidir.'),
  userPlan: z.enum(["free", "premium", "pro"]).describe("Kullanıcının mevcut üyelik planı."),
  customModelIdentifier: z.string().optional().describe("Adminler için özel model seçimi."),
  isAdmin: z.boolean().optional().describe("Kullanıcının admin olup olmadığını belirtir."),
});
export type ExamReportAnalyzerInput = z.infer<typeof ExamReportAnalyzerInputSchema>;

const IdentifiedTopicSchema = z.object({
    topic: z.string().describe("Rapordan tespit edilen ders, ünite veya konu başlığı."),
    analysis: z.string().describe("Bu konudaki performansın (doğru, yanlış, boş, puan vb. bilgilere dayanarak) YKS odaklı analizi, potansiyel zayıflıklar ve bu zayıflıkları gidermek için spesifik öneriler."),
    status: z.enum(["strong", "needs_improvement", "weak"]).describe("Belirlenen konudaki genel performans durumu.")
});

const ExamReportAnalyzerOutputSchema = z.object({
  identifiedTopics: z.array(IdentifiedTopicSchema).describe('Sınav raporundan tespit edilen konular ve her biri için detaylı analiz ve öneriler. Bir analiz yapılamıyorsa veya hata oluşursa, bu alan boş bir dizi olmalıdır.'),
  overallFeedback: z.string().describe('Sınavın geneli hakkında YKS öğrencisine yönelik yapıcı, motive edici ve kapsamlı bir geri bildirim. Genel başarı durumu, dikkat çeken noktalar ve genel strateji önerileri içerebilir. Bir analiz yapılamıyorsa veya hata oluşursa, bu alana uygun bir hata mesajı yazılmalıdır.'),
  studySuggestions: z.array(z.string()).describe('Belirlenen eksikliklere ve genel performansa dayalı olarak YKS için öncelikli çalışma alanları ve genel çalışma stratejileri. Bir analiz yapılamıyorsa veya hata oluşursa, bu alan boş bir dizi olmalıdır.'),
  reportSummaryTitle: z.string().optional().describe("Analiz edilen sınav raporu için kısa bir başlık (örn: 'AYT Matematik Deneme Analizi'). Hata durumunda 'Analiz Başarısız' gibi bir başlık olabilir.")
});
export type ExamReportAnalyzerOutput = z.infer<typeof ExamReportAnalyzerOutputSchema>;

export async function analyzeExamReport(input: ExamReportAnalyzerInput): Promise<ExamReportAnalyzerOutput> {
  console.log(`[Exam Report Analyzer Action] Received input. User Plan: ${input.userPlan}, Admin Model ID (raw): '${input.customModelIdentifier}', isAdmin: ${input.isAdmin}`);

  let modelToUse: string;
  const adminModelChoice = input.customModelIdentifier;

  if (adminModelChoice && typeof adminModelChoice === 'string' && adminModelChoice.trim() !== "") {
    const customIdLower = adminModelChoice.toLowerCase().trim();
    console.log(`[Exam Report Analyzer Action] Admin specified customModelIdentifier (processed): '${customIdLower}' from input: '${adminModelChoice}'`);
    switch (customIdLower) {
      case 'default_gemini_flash':
        modelToUse = 'googleai/gemini-2.0-flash';
        break;
      case 'experimental_gemini_1_5_flash':
        modelToUse = 'googleai/gemini-1.5-flash-latest';
        break;
      case 'experimental_gemini_2_5_flash_preview_05_20':
        modelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
        break;
      default:
        if (customIdLower.startsWith('googleai/')) {
            modelToUse = customIdLower;
            console.warn(`[Exam Report Analyzer Action] Admin specified a direct Genkit model name: '${modelToUse}'. Ensure this model is supported.`);
        } else {
            console.warn(`[Exam Report Analyzer Action] Admin specified an UNKNOWN customModelIdentifier: '${input.customModelIdentifier}'. Falling back to universal default for all users.`);
            modelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
        }
        break;
    }
  } else {
    console.log(`[Exam Report Analyzer Action] No valid custom model specified. Using universal default 'googleai/gemini-2.5-flash-preview-05-20' for all users.`);
    modelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
  }
  
  // Absolute fallback if modelToUse is somehow still invalid
  if (typeof modelToUse !== 'string' || !modelToUse.startsWith('googleai/')) { 
      console.error(`[Exam Report Analyzer Action] CRITICAL FALLBACK: modelToUse was invalid ('${modelToUse}', type: ${typeof modelToUse}). Defaulting to 'googleai/gemini-2.5-flash-preview-05-20'.`);
      modelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
  }
  console.log(`[Exam Report Analyzer Action] Final model determined for flow: ${modelToUse}`);
  
  const isProUser = input.userPlan === 'pro';
  const isPremiumUser = input.userPlan === 'premium';
  const isGemini25PreviewSelected = modelToUse === 'googleai/gemini-2.5-flash-preview-05-20';

  const enrichedInput = {
    ...input,
    isProUser,
    isPremiumUser,
    isCustomModelSelected: !!input.customModelIdentifier,
    isGemini25PreviewSelected,
    isAdmin: !!input.isAdmin,
  };
  return examReportAnalyzerFlow(enrichedInput, modelToUse);
}

const promptInputSchema = ExamReportAnalyzerInputSchema.extend({
    isProUser: z.boolean().optional(),
    isPremiumUser: z.boolean().optional(),
    isCustomModelSelected: z.boolean().optional(),
    isGemini25PreviewSelected: z.boolean().optional(),
});

const prompt = ai.definePrompt({
  name: 'examReportAnalyzerPrompt',
  input: {schema: promptInputSchema},
  output: {schema: ExamReportAnalyzerOutputSchema},
  prompt: `Sen, YKS sınav raporlarını analiz eden ve öğrencilere özel geri bildirimler sunan bir AI YKS danışmanısın. Amacın, raporu değerlendirip öğrencinin YKS başarısını artırmasına yardımcı olmaktır. Cevapların Türkçe olmalıdır.
ÇIKTIN HER ZAMAN ExamReportAnalyzerOutputSchema ile tanımlanmış JSON formatına HARFİYEN UYMALIDIR. ASLA null veya tanımsız bir yanıt döndürme.
Eğer bir hata oluşursa veya istenen bilgiyi üretemezsen bile, "identifiedTopics" (boş bir dizi olabilir), "overallFeedback" (bir hata mesajı içerebilir), "studySuggestions" (boş bir dizi olabilir) ve "reportSummaryTitle" (isteğe bağlı, "Analiz Başarısız" gibi bir başlık olabilir) alanlarını içeren geçerli bir JSON nesnesi döndür. Özellikle "overallFeedback" alanı ASLA BOŞ BIRAKILMAMALI, gerekirse bir hata mesajı içermelidir.

Kullanıcının üyelik planı: {{{userPlan}}}.
{{#if isAdmin}}
(Admin Kullanıcı Notu: Şu anda admin olarak test yapıyorsunuz. Model ve detay seviyesi seçimleriniz önceliklidir.)
{{/if}}
{{#if isProUser}}
(Pro Kullanıcı Notu: Bu Pro seviyesindeki detaylı analiz ve stratejik öneriler, üyeliğinizin özel bir avantajıdır. Analizini en üst düzeyde akademik titizlikle yap. Öğrencinin farkında olmadığı örtük bilgi eksikliklerini tespit etmeye çalış. En kapsamlı stratejik yol haritasını, YKS'de sık yapılan hatalardan kaçınma yollarını, zaman yönetimi ve stresle başa çıkma tekniklerini detaylıca sun.)
{{else if isPremiumUser}}
(Premium Kullanıcı Notu: Daha detaylı konu analizi yap. Belirlenen zayıflıklar için 1-2 etkili çalışma tekniği (örn: Feynman Tekniği, Pomodoro) ve genel motivasyonunu artıracak pratik ipuçları öner.)
{{else}}
(Ücretsiz Kullanıcı Notu: Analizini temel düzeyde yap. Genel çalışma alışkanlıkları ve düzenli tekrarın önemi gibi 1-2 genel YKS tavsiyesi sun.)
{{/if}}

{{#if isCustomModelSelected}}
  {{#if customModelIdentifier}}
    (Admin Notu: Özel model '{{{customModelIdentifier}}}' seçildi.)
  {{/if}}
{{/if}}

{{#if isGemini25PreviewSelected}}
(Gemini 2.5 Flash Preview 05-20 Modeli Notu: Yanıtların ÖZ ama ANLAŞILIR ve YKS öğrencisine doğrudan fayda sağlayacak şekilde olsun. HIZLI yanıt vermeye odaklan. {{#if isProUser}}Pro kullanıcı için gereken derinliği ve stratejik bilgileri koruyarak{{else if isPremiumUser}}Premium kullanıcı için gereken detayları ve pratik ipuçlarını sağlayarak{{/if}} gereksiz uzun açıklamalardan ve süslemelerden kaçın, doğrudan konuya girerek en kritik bilgileri vurgula.)
{{/if}}

Öğrencinin Sınav Raporu Metni:
{{{reportTextContent}}}

Lütfen bu raporu analiz et ve aşağıdaki JSON formatına HARFİYEN uyacak şekilde çıktı oluştur:
1.  **identifiedTopics (IdentifiedTopicSchema dizisi, zorunlu)**: Her ders/konu için:
    *   **topic (string, zorunlu)**: Ders/ünite/konu adı.
    *   **analysis (string, zorunlu)**: Performansın YKS odaklı analizi, zayıflıklar ve spesifik öneriler.
    *   **status (string, zorunlu)**: 'strong', 'needs_improvement', 'weak' seçeneklerinden biri.
    Eğer konu analizi yapılamıyorsa, bu dizi boş olabilir [].
2.  **overallFeedback (string, zorunlu)**: Sınavın geneli hakkında yapıcı, motive edici geri bildirim. Hata durumunda bile, bu alana bir hata mesajı yaz. ASLA BOŞ BIRAKMA.
3.  **studySuggestions (string dizisi, zorunlu)**: En kritik eksiklik alanlarına yönelik YKS için öncelikli çalışma stratejileri. Hata durumunda boş bir dizi [] olabilir.
4.  **reportSummaryTitle (string, isteğe bağlı)**: Rapor için kısa başlık. Hata durumunda "Analiz Hatası" gibi bir başlık olabilir.

Analiz İlkeleri:
*   Sayısal verileri (D, Y, B, net, puan) dikkatlice yorumla.
*   En çok zorlanılan veya puan kaybedilen konuları önceliklendir.
*   Geri bildirimler YKS formatına uygun olsun.
*   Motive edici bir dil kullan.
*   Rapor metni yetersizse, nazikçe daha detaylı metin isteyebilirsin ANCAK ÇIKTIN HER ZAMAN JSON FORMATINDA OLMALI VE ZORUNLU ALANLARI (özellikle overallFeedback) İÇERMELİDİR.
`,
});

const examReportAnalyzerFlow = ai.defineFlow(
  {
    name: 'examReportAnalyzerFlow',
    inputSchema: promptInputSchema,
    outputSchema: ExamReportAnalyzerOutputSchema,
  },
  async (enrichedInput: z.infer<typeof promptInputSchema>, modelToUseParam: string ): Promise<ExamReportAnalyzerOutput> => {
    
    let finalModelToUse = modelToUseParam;
    console.log(`[Exam Report Analyzer Flow] Initial modelToUseParam: '${finalModelToUse}', type: ${typeof finalModelToUse}, isAdmin: ${enrichedInput.isAdmin}`);

    if (typeof finalModelToUse !== 'string' || !finalModelToUse.startsWith('googleai/')) {
        console.warn(`[Exam Report Analyzer Flow] Invalid or non-string modelToUseParam ('${finalModelToUse}', type: ${typeof finalModelToUse}) received in flow. Defaulting to universal default 'googleai/gemini-2.5-flash-preview-05-20'.`);
        finalModelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
    }
    console.log(`[Exam Report Analyzer Flow] Corrected/Final model INSIDE FLOW to: ${finalModelToUse}`);
    
    const standardTemperature = 0.6;
    const standardSafetySettings = [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ];
    
    let maxOutputTokens = 4096;
     if (enrichedInput.isProUser || enrichedInput.isPremiumUser) {
        maxOutputTokens = 8000;
    }
    if (finalModelToUse.includes('flash')) {
      maxOutputTokens = Math.min(maxOutputTokens, 8192); 
    }


    const callOptions: { model: string; config?: Record<string, any> } = { 
      model: finalModelToUse,
      config: {
        temperature: standardTemperature,
        safetySettings: standardSafetySettings,
        maxOutputTokens: maxOutputTokens,
      }
    };
    
    const promptInputForLog = { ...enrichedInput, resolvedModelUsed: finalModelToUse, calculatedMaxOutputTokens: maxOutputTokens };
    console.log(`[Exam Report Analyzer Flow] Using Genkit model: ${finalModelToUse} for plan: ${enrichedInput.userPlan}, customModel (raw): ${enrichedInput.customModelIdentifier}, isAdmin: ${enrichedInput.isAdmin}, with config: ${JSON.stringify(callOptions.config)}`);

    try {
        const {output} = await prompt(promptInputForLog, callOptions);
        
        if (!output || typeof output.overallFeedback !== 'string' || output.overallFeedback.trim().length === 0) {
          const errorDetail = !output ? "Model 'null' (boş) yanıt döndürdü." : "Modelin 'overallFeedback' alanı boş veya geçersiz.";
          console.error(`[Exam Report Analyzer Flow] AI did not produce valid analysis or overallFeedback is missing. Model: ${finalModelToUse}. Output:`, JSON.stringify(output).substring(0,300));
          
          const adminErrorMessage = `[Admin Gördü] AI Modeli (${finalModelToUse}), beklenen yanıt şemasına uymayan bir çıktı üretti çünkü ${errorDetail}. Raw Output: ${JSON.stringify(output).substring(0,200)}`;
          const userErrorMessage = GENERIC_USER_ERROR_MESSAGE;

          return {
              identifiedTopics: (output?.identifiedTopics && Array.isArray(output.identifiedTopics)) ? output.identifiedTopics : [],
              overallFeedback: enrichedInput.isAdmin ? adminErrorMessage : userErrorMessage,
              studySuggestions: (output?.studySuggestions && Array.isArray(output.studySuggestions)) ? output.studySuggestions : ["Lütfen rapor metnini kontrol edin veya daha sonra tekrar deneyin."],
              reportSummaryTitle: output?.reportSummaryTitle || "Analiz Hatası"
          };
        }
        // Ensure other arrays are at least empty arrays if not provided, to satisfy schema
        return {
            ...output,
            identifiedTopics: output.identifiedTopics || [],
            studySuggestions: output.studySuggestions || [],
        };

    } catch (error: any) {
      const rawErrorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
      console.error(`[Exam Report Analyzer Flow] CRITICAL ERROR during prompt execution with model ${finalModelToUse}. Admin: ${enrichedInput.isAdmin}. Error details:`, rawErrorDetails);
      
      let detailedAdminError = `AI modeli (${finalModelToUse}) ile sınav raporu analizi yapılırken bir Genkit/AI hatası oluştu.`;
      if (error.message) {
          detailedAdminError += ` Mesaj: ${error.message.substring(0, 300)}.`;
           if (error.message.includes('SAFETY') || error.message.includes('block_reason')) {
            detailedAdminError = `[Admin Gördü] İçerik güvenlik filtrelerine takılmış olabilir. Model: ${finalModelToUse}. Detay: ${error.message.substring(0, 150)}`;
          } else if (error.name === 'GenkitError' && error.message.includes('Schema validation failed')) {
            let zodErrors = "Şema Doğrulama Hatası.";
             if (error.details && Array.isArray(error.details)) {
                zodErrors = error.details.map((detail: any) => `[${detail.path?.join('.') || 'root'}]: ${detail.message}`).join('; ');
            }
            detailedAdminError = `[Admin Gördü] AI modeli (${finalModelToUse}) gelen yanıt beklenen şemayla uyuşmuyor: ${zodErrors.substring(0, 400)}. Raw Hata Detayları: ${JSON.stringify(error.details).substring(0,300)}`;
          }
      } else {
         detailedAdminError += ` Raw Hata: ${rawErrorDetails.substring(0, 500)}`;
      }

      return {
          identifiedTopics: [],
          overallFeedback: enrichedInput.isAdmin ? detailedAdminError : GENERIC_USER_ERROR_MESSAGE,
          studySuggestions: ["Lütfen rapor metnini kontrol edin veya daha sonra tekrar deneyin."],
          reportSummaryTitle: "Analiz Hatası"
      };
    }
  }
);
    

    

    