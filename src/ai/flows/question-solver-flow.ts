
'use server';
/**
 * @fileOverview YKS'ye hazırlanan öğrencilerin karşılaştığı akademik soruları (metin veya görsel tabanlı)
 * adım adım çözen, ilgili kavramları açıklayan ve YKS odaklı ipuçları veren uzman bir AI öğretmeni.
 *
 * - solveQuestion - Kullanıcının sorduğu bir soruyu çözme işlemini yöneten fonksiyon.
 * - SolveQuestionInput - solveQuestion fonksiyonu için giriş tipi.
 * - SolveQuestionOutput - solveQuestion fonksiyonu için dönüş tipi.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UserProfile } from '@/types';

const GENERIC_USER_ERROR_MESSAGE = "AI Soru Çözücü şu anda bir sorun yaşıyor gibi görünüyor. Lütfen biraz sonra tekrar deneyin veya farklı bir soru sormayı deneyin.";

const SolveQuestionInputSchema = z.object({
  questionText: z.string().optional().describe('Öğrencinin çözülmesini istediği, YKS kapsamındaki soru metni.'),
  imageDataUri: z.string().optional().describe("Soruyla ilgili bir görselin data URI'si (Base64 formatında). 'data:<mimetype>;base64,<encoded_data>' formatında olmalıdır. Görsel, soru metni yerine veya ona ek olarak sunulabilir."),
  solutionDetailLevel: z.enum(["temel", "orta", "detayli"]).optional().default("orta").describe("İstenen çözümün detay seviyesi: 'temel' (ana adımlar, kısa cevap), 'orta' (adım açıklamaları, temel kavramlar), 'detayli' (çok ayrıntılı anlatım, derinlemesine kavramlar)."),
  userPlan: z.enum(["free", "premium", "pro"]).describe("Kullanıcının mevcut üyelik planı."),
  customModelIdentifier: z.string().optional().describe("Adminler için özel model seçimi (örn: 'default_gemini_flash', 'experimental_gemini_1_5_flash', 'experimental_gemini_2_5_flash_preview_05_20')."),
  isAdmin: z.boolean().optional().describe("Kullanıcının admin olup olmadığını belirtir."),
});
export type SolveQuestionInput = z.infer<typeof SolveQuestionInputSchema>;

const SolveQuestionOutputSchema = z.object({
  solution: z.string().describe('Sorunun YKS öğrencisinin anlayacağı dilde, ÖNCE NET BİR ŞEKİLDE CEVABI (örn: Cevap: B) BELİRTEN, SONRA YENİ BİR SATIRDA sorunun hangi konuyla ilgili olduğunu ve ne gerektirdiğini açıklayan kısa bir giriş yapan, SONRA "Açıklama:" veya "Çözüm Yolu (Adım Adım):" BAŞLIĞI ALTINDA adım adım çözümü ve kavramsal açıklaması. Eğer çözüm üretilemiyorsa, nedenini belirten bir mesaj içermelidir.'),
  relatedConcepts: z.array(z.string()).optional().describe('Çözümle ilgili veya sorunun ait olduğu konudaki YKS için önemli 2-3 anahtar akademik kavram veya konu başlığı. Boş olabilir.'),
  examStrategyTips: z.array(z.string()).optional().describe("Bu tür soruları YKS'de çözerken kullanılabilecek stratejiler veya dikkat edilmesi gereken noktalar. Boş olabilir."),
});
export type SolveQuestionOutput = z.infer<typeof SolveQuestionOutputSchema>;


export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  console.log(`[Question Solver Action] Entry. User input isAdmin: ${input.isAdmin}, User Plan: ${input.userPlan}, Custom Model (raw): '${input.customModelIdentifier}', Detail Level: ${input.solutionDetailLevel}`);

  if (!input.questionText && !input.imageDataUri) {
    return {
      solution: "Lütfen çözülmesini istediğiniz bir soru metni girin veya bir görsel yükleyin.",
      relatedConcepts: [],
      examStrategyTips: [],
    };
  }

  let modelToUse: string;
  const adminModelChoice = input.customModelIdentifier;

  if (adminModelChoice && typeof adminModelChoice === 'string' && adminModelChoice.trim() !== "") {
    const customIdLower = adminModelChoice.toLowerCase().trim();
    console.log(`[Question Solver Action] Admin specified customModelIdentifier (processed): '${customIdLower}' from input: '${adminModelChoice}'`);
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
            console.warn(`[Question Solver Action] Admin specified a direct Genkit model name: '${modelToUse}'. Ensure this model is supported.`);
        } else {
            console.warn(`[Question Solver Action] Admin specified an UNKNOWN customModelIdentifier: '${adminModelChoice}'. Falling back to universal default for all users.`);
            modelToUse = 'googleai/gemini-2.5-flash-preview-05-20'; 
        }
        break;
    }
  } else {
    console.log(`[Question Solver Action] No valid custom model specified. Using universal default 'googleai/gemini-2.5-flash-preview-05-20' for all users.`);
    modelToUse = 'googleai/gemini-2.5-flash-preview-05-20'; 
  }

  if (typeof modelToUse !== 'string' || !modelToUse.startsWith('googleai/')) {
      console.error(`[Question Solver Action] CRITICAL FALLBACK: modelToUse was invalid ('${modelToUse}', type: ${typeof modelToUse}). Defaulting to 'googleai/gemini-2.5-flash-preview-05-20'.`);
      modelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
  }
  console.log(`[Question Solver Action] Final model determined for flow: ${modelToUse}`);

  const enrichedInput = {
    ...input,
    isProUser: input.userPlan === 'pro',
    isPremiumUser: input.userPlan === 'premium',
    isCustomModelSelected: !!input.customModelIdentifier,
    isGemini25PreviewSelected: modelToUse === 'googleai/gemini-2.5-flash-preview-05-20',
    isAdmin: !!input.isAdmin, 
    solutionDetailLevel: input.solutionDetailLevel || "orta", 
  };

  try {
    console.log(`[Question Solver Action] Calling questionSolverFlow. isAdmin in enrichedInput: ${enrichedInput.isAdmin}`);
    const result = await questionSolverFlow(enrichedInput, modelToUse);
    
    if (input.isAdmin && result.solution === GENERIC_USER_ERROR_MESSAGE) {
        console.warn(`[Question Solver Action] Admin user received generic error from flow. Input isAdmin: ${input.isAdmin}, Flow enrichedInput.isAdmin: ${enrichedInput.isAdmin}. This might indicate isAdmin flag propagation issue within the flow or the flow itself returned a generic error.`);
        return {
            solution: `[Admin Gördü - Olası Bayrak Uyuşmazlığı veya Akış Hatası] AI Soru Çözücü (${modelToUse}) genel bir hata mesajı döndürdü: "${result.solution}". Akış loglarını kontrol edin. EnrichedInput.isAdmin: ${enrichedInput.isAdmin}`,
            relatedConcepts: (result.relatedConcepts && result.relatedConcepts.length > 0) ? result.relatedConcepts : ["Admin Bayrak Uyuşmazlığı"],
            examStrategyTips: (result.examStrategyTips && result.examStrategyTips.length > 0) ? result.examStrategyTips : ["Akış loglarını kontrol edin."],
        };
    }
    console.log("[Question Solver Action] Successfully received result from questionSolverFlow.");
    return result;
  } catch (error: any) { 
    console.error(`[Question Solver Action] CRITICAL error during server action execution (outer try-catch). Admin Flag from input: ${input.isAdmin}. Model: ${modelToUse}. Error:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    let errorMessage = 'Bilinmeyen bir sunucu hatası oluştu.';
    if (error instanceof Error && typeof error.message === 'string') {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else if (input.isAdmin) {
        try {
            errorMessage = `Detaylandırılamayan nesne hatası (Admin): ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
        } catch (e) {
            errorMessage = "Detaylandırılamayan ve stringify edilemeyen nesne hatası (Admin).";
        }
    }

    const adminOuterCatchError = `[Admin Gördü - Sunucu Aksiyonu Hatası] Model: ${modelToUse}. Detay: ${errorMessage.substring(0, 500)}`;
    const userOuterCatchError = `Soru çözümü oluşturulurken beklenmedik bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.`;

    return {
        solution: input.isAdmin ? adminOuterCatchError : userOuterCatchError,
        relatedConcepts: input.isAdmin ? ["Kritik Sunucu Hatası"] : [],
        examStrategyTips: input.isAdmin ? ["Tekrar deneyin"] : [],
    };
  }
}

const promptInputSchema = SolveQuestionInputSchema.extend({
    isProUser: z.boolean().optional(),
    isPremiumUser: z.boolean().optional(),
    isCustomModelSelected: z.boolean().optional(),
    isGemini25PreviewSelected: z.boolean().optional(),
});

const questionSolverPrompt = ai.definePrompt({
  name: 'questionSolverPrompt',
  input: {schema: promptInputSchema},
  output: {schema: SolveQuestionOutputSchema},
  prompt: `Sen, YKS (TYT–AYT) sınavına hazırlanan öğrencilere, tüm derslerde en karmaşık soruları bile temel prensiplerine indirgeyerek, adım adım, son derece anlaşılır, pedagojik değeri yüksek ve öğrenciyi düşündürmeye teşvik eden bir şekilde çözmede uzmanlaşmış, kıdemli bir AI YKS uzman öğretmenisin.
Amacın sadece doğru cevabı vermek değil, aynı zamanda sorunun çözüm mantığını, altında yatan temel prensipleri ve YKS'de sıkça sorulan püf noktalarını vurgulamaktır.
Matematiksel sembolleri (örn: x^2, H_2O, √, π, ±, ≤, ≥) metin içinde açıkça ve anlaşılır bir şekilde kullan. Denklemleri veya önemli ifadeleri yazarken Markdown formatlamasına (örn: \`denklem\` veya \`\`\` ile kod blokları) dikkat et ve doğru kapat.

Cevapların her zaman Türkçe olmalıdır.

Kullanıcının üyelik planı: {{{userPlan}}}.
{{#if isAdmin}}
(Admin Kullanıcı Notu: Şu anda admin olarak test yapıyorsunuz. Model ve detay seviyesi seçimleriniz önceliklidir.)
{{/if}}
İstenen Çözüm Detay Seviyesi: {{{solutionDetailLevel}}}.

{{#if isProUser}}
(Pro Kullanıcı Notu: Bu Pro seviyesindeki uzman çözüm, üyeliğinizin özel bir avantajıdır. Çözümlerini üst düzeyde akademik titizlikle sun. Varsa birden fazla çözüm yolunu kısaca belirt. Sorunun çözümünde kullanılan anahtar kavramları derinlemesine açıkla. Bu tür sorularla ilgili YKS'de karşılaşılabilecek farklı varyasyonlara ve genel sınav stratejilerine (örn: zaman yönetimi, eleme teknikleri) değin. Sorunun YKS'deki stratejik önemine vurgu yap.)
{{else if isPremiumUser}}
(Premium Kullanıcı Notu: Daha derinlemesine açıklamalar yapmaya çalış. Varsa alternatif çözüm yollarına kısaca değin. Sorunun çözümünde kullanılan temel prensipleri ve 1-2 önemli YKS ipucunu belirt.)
{{else}}
(Ücretsiz Kullanıcı Notu: Soruyu adım adım ve anlaşılır bir şekilde çöz. Temel kavramlara değin. Çözümde 1 genel YKS ipucu ver.)
{{/if}}

{{#if isCustomModelSelected}}
  {{#if customModelIdentifier}}
(Admin Notu: Özel model '{{{customModelIdentifier}}}' seçildi.)
  {{/if}}
{{/if}}

{{#if isGemini25PreviewSelected}}
(Gemini 2.5 Flash Preview 05-20 Modeli Notu: Çözümü ana adımları ve kilit mantıksal çıkarımları vurgulayarak, olabildiğince ÖZ ama ANLAŞILIR olmalıdır. Adım adım çözüm bölümünde, gereksiz ara hesaplamaları özetle veya atla, sadece kilit adımlara odaklan. {{#if isProUser}}Pro kullanıcı için gereken derinliği ve stratejik bilgileri koruyarak{{else if isPremiumUser}}Premium kullanıcı için gereken detayları ve pratik ipuçlarını sağlayarak{{/if}} aşırı detaydan kaçının, doğrudan ve net bir çözüm sun. HIZLI YANIT VERMESİ ÖNEMLİDİR.)
{{else}}
(Diğer Model Notu: Çözümü ayrıntılı ve SATIR SATIR açıkla.)
{{/if}}

Kullanıcının girdileri aşağıdadır:
{{#if imageDataUri}}
Görsel Soru Kaynağı:
{{media url=imageDataUri}}
(Eğer görseldeki soru metin içeriyorsa, bu metni çözümüne dahil et. Görseldeki şekilleri, grafikleri veya tabloları dikkatlice analiz et.)
{{/if}}
{{#if questionText}}
Metinsel Soru/Açıklama:
{{{questionText}}}
{{/if}}

Lütfen bu soruyu/soruları analiz et ve aşağıdaki JSON formatına HARFİYEN uyacak şekilde, ÖĞRETİCİ bir yanıt hazırla:
ÇIKTIN HER ZAMAN SolveQuestionOutputSchema ile tanımlanmış geçerli bir JSON nesnesi olmalıdır. "solution" (string), "relatedConcepts" (string dizisi, boş olabilir) ve "examStrategyTips" (string dizisi, boş olabilir) alanlarını içermelidir.
ASLA null veya tanımsız bir yanıt döndürme. Eğer soru çözülemiyorsa veya girdi yetersizse, "solution" alanına nedenini açıklayan bir mesaj yaz (örneğin, "Bu soru için bir çözüm üretemedim çünkü görseldeki ifadeler net değil.") ve diğer alanları boş dizi ([]) olarak bırak. "solution" alanı ASLA BOŞ BIRAKILMAMALI ve her zaman bir string içermelidir.
Eğer model olarak bir hata oluştuysa veya cevap üretilemiyorsa, yine de "solution" alanını "Üzgünüm, bu soru için bir çözüm üretemedim. [Kısa hata açıklaması]" şeklinde, "relatedConcepts" ve "examStrategyTips" alanlarını ise boş bir dizi ([]) olarak içeren geçerli bir JSON nesnesi DÖNDÜR. KESİNLİKLE null veya tanımsız bir cevap DÖNDÜRME.

İstenen Çıktı Bölümleri (bu JSON formatına uy):
1.  **solution (string, zorunlu)**:
    *   **ÖNCELİKLE, SATIR 1'DE SADECE SORUNUN CEVABINI "Cevap: [Doğru Cevap]" veya "Sonuç: [Sonuç]" şeklinde NET BİR İFADEYLE BAŞLAT.** Bu sadece cevap harfi, kısa kelime veya sayı olmalı.
    *   **HEMEN ALTINA, SATIR 2'DE (YENİ BİR PARAGRAF OLARAK), sorunun hangi YKS dersi ve ana konusuna ait olduğunu ve sorunun genel olarak neyi test ettiğini/gerektirdiğini KISACA açıkla.** (Örn: "Bu soru, Matematik dersinin Türev konusuna ait olup, bir fonksiyonun verilen bir aralıktaki maksimum ve minimum değerlerini bulmayı gerektirmektedir.")
    *   Ardından, "Açıklama:" veya "Çözüm Yolu (Adım Adım):" gibi bir BAŞLIK KULLANARAK çözümü başlat.
    *   Çözüm için gerekli TEMEL BİLGİLERİ (ana formül veya kavram) listele.
    *   Soruyu, İSTENEN ÇÖZÜM DETAY SEVİYESİNE ({{{solutionDetailLevel}}}) göre ana adımları mantığıyla birlikte, AÇIKLAYARAK çöz. Çözümü paragraflar veya maddeler halinde sun.
        *   'temel' seviye için: Çözümü ana adımlarıyla, çok kısa ve öz bir şekilde ver.
        *   'orta' seviye için: Her adımı kısa açıklamalarla destekle. Temel kavramlara değin.
        *   'detayli' seviye için: Her adımı mantığıyla, ara hesaplamalarla ve kullanılan formüllerle çok detaylı açıkla. {{#if isProUser}}Pro kullanıcıya özel olarak, varsa alternatif çözüm yollarına, sık yapılan hatalara ve konseptlere derinlemesine değin.{{/if}}
    *   Her bir önemli matematiksel işlemi veya mantıksal çıkarımı net bir şekilde belirt.
    *   Eğer girdi yetersiz, anlamsız veya YKS standartlarında çözülemeyecek kadar belirsizse, bu alana "Bu soruyu çözebilmek için daha fazla bilgiye/netliğe veya görseldeki ifadenin metin olarak yazılmasına ihtiyacım var." gibi bir geri bildirim yaz.
2.  **relatedConcepts (string dizisi, isteğe bağlı, boş olabilir)**:
    *   Çözümde kullanılan veya soruyla yakından ilişkili, YKS'de bilinmesi gereken temel kavramları LİSTELE. Boş bir dizi olabilir.
3.  **examStrategyTips (string dizisi, isteğe bağlı, boş olabilir)**:
    *   Bu tür sorularla ilgili pratik YKS stratejileri veya ipuçlarını LİSTELE. Boş bir dizi olabilir.

Davranış Kuralları:
*   Eğer hem görsel hem de metin girdisi varsa, bunları birbiriyle ilişkili kabul et.
*   Yanıtını öğrencinin kolayca anlayabileceği, teşvik edici ve eğitici bir dille yaz.
*   ÇIKTININ İSTENEN JSON ŞEMASINA TAM OLARAK UYDUĞUNDAN EMİN OL. "solution" bir string, "relatedConcepts" ve "examStrategyTips" ise string dizileri (boş olabilirler) olmalıdır.
`,
});

const questionSolverFlow = ai.defineFlow(
  {
    name: 'questionSolverFlow',
    inputSchema: promptInputSchema,
    outputSchema: SolveQuestionOutputSchema,
  },
  async (enrichedInput: z.infer<typeof promptInputSchema>, modelToUseParam: string): Promise<SolveQuestionOutput> => {
    let finalModelToUse = modelToUseParam;

    console.log(`[Question Solver Flow] Entry. Admin Flag from enrichedInput: ${enrichedInput.isAdmin}, User Plan: ${enrichedInput.userPlan}, Custom Model (raw): '${enrichedInput.customModelIdentifier}', Detail Level: ${enrichedInput.solutionDetailLevel}, Model to use initially: ${finalModelToUse}`);

    if (typeof finalModelToUse !== 'string' || !finalModelToUse.startsWith('googleai/')) {
        console.warn(`[Question Solver Flow] Invalid or non-string modelToUseParam ('${finalModelToUse}', type: ${typeof finalModelToUse}) received. Forcing universal 'googleai/gemini-2.5-flash-preview-05-20'.`);
        finalModelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
    }
    console.log(`[Question Solver Flow] Corrected/Final model INSIDE FLOW to: ${finalModelToUse}`);

    const standardTemperature = 0.5;
    const standardSafetySettings = [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ];

    let maxOutputTokens = 4096;
    if (enrichedInput.solutionDetailLevel === 'detayli' || enrichedInput.isProUser) {
        maxOutputTokens = 8000;
    } else if (enrichedInput.solutionDetailLevel === 'orta') {
        maxOutputTokens = 4096;
    } else { 
        maxOutputTokens = 2048;
    }
    if (enrichedInput.isProUser) { 
        maxOutputTokens = Math.max(maxOutputTokens, 8000);
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
    
    const loggableInput = { ...enrichedInput, imageDataUri: enrichedInput.imageDataUri ? `Image data URI provided (length: ${enrichedInput.imageDataUri.length})` : undefined};
    console.log(`[Question Solver Flow] Input to prompt (loggableInput):`, JSON.stringify(loggableInput).substring(0, 1000) + (JSON.stringify(loggableInput).length > 1000 ? "..." : ""));
    console.log(`[Question Solver Flow] Using Genkit model: ${finalModelToUse} for plan: ${enrichedInput.userPlan}, customModel (raw): ${enrichedInput.customModelIdentifier}, detail: ${enrichedInput.solutionDetailLevel}, isAdmin: ${enrichedInput.isAdmin}, with config: ${JSON.stringify(callOptions.config)}`);


    try {
      const { output } = await questionSolverPrompt(enrichedInput, callOptions); 

      if (output === null || typeof output !== 'object' || typeof output.solution !== 'string' || output.solution.trim().length === 0) {
        const rawOutputPreview = output === null ? "null" : (JSON.stringify(output, null, 2).substring(0, 500) + "...");
        let errorReason = "bilinmeyen bir nedenle";
        if (output === null) errorReason = "model boş bir yanıt ('null') döndürdü";
        else if (typeof output !== 'object') errorReason = "model beklenen nesne yapısında bir yanıt döndürmedi";
        else if (typeof output.solution !== 'string' || output.solution.trim().length === 0) errorReason = "modelin döndürdüğü 'solution' alanı boş veya geçersiz";

        console.error(`[Question Solver Flow] AI returned null or malformed/empty output (not matching schema). Model: ${finalModelToUse}. Output Preview:`, rawOutputPreview, `isAdmin: ${enrichedInput.isAdmin}`);

        const adminErrorMessage = `[Admin Gördü - Akış İçi Hata] AI Soru Çözücüsü (${finalModelToUse}), beklenen yanıt şemasına uymayan bir çıktı üretti çünkü ${errorReason}. Raw output: ${rawOutputPreview}`;
        
        return {
            solution: enrichedInput.isAdmin ? adminErrorMessage : GENERIC_USER_ERROR_MESSAGE,
            relatedConcepts: (output && Array.isArray(output.relatedConcepts)) ? output.relatedConcepts : (enrichedInput.isAdmin ? ["Hata (Geçersiz Çıktı Yapısı)"] : []),
            examStrategyTips: (output && Array.isArray(output.examStrategyTips)) ? output.examStrategyTips : [],
        };
      }

      console.log("[Question Solver Flow] Successfully received and validated (implicitly by Genkit) solution from AI model.");
      return {
        solution: output.solution,
        relatedConcepts: output.relatedConcepts || [], // Ensure arrays are present
        examStrategyTips: output.examStrategyTips || [], // Ensure arrays are present
      };

    } catch (promptError: any) {
      console.error(`[Question Solver Flow] INNER CATCH: CRITICAL ERROR during prompt execution with model ${finalModelToUse}. Admin Flag from enrichedInput: ${enrichedInput.isAdmin}. Error (stringified):`, JSON.stringify(promptError, Object.getOwnPropertyNames(promptError), 2));
      
      let detailedAdminError = `[Admin Gördü - Akış İçi Hata] AI Soru Çözücüsü (${finalModelToUse}) bir hata ile karşılaştı. `;
      
      const errorName = promptError?.name || 'Bilinmeyen Hata Adı';
      const errorMessage = promptError?.message || 'Hata mesajı yok.';
      const errorStack = promptError?.stack || 'Stack bilgisi yok.';
      const errorCause = promptError?.cause;
      const errorDetails = promptError?.details;

      detailedAdminError += `Hata Adı: ${errorName}. Mesaj: ${errorMessage.substring(0, 500)}. `;
        
      if (errorName === 'GenkitError' && errorMessage.includes('Schema validation failed')) {
          let zodErrors = "Şema Doğrulama Hatası.";
          if (errorDetails && Array.isArray(errorDetails) && errorDetails.length > 0) {
              zodErrors = errorDetails.map((detail: any) => {
                  const path = detail.path && Array.isArray(detail.path) ? detail.path.join('.') : 'root';
                  return `[${path}]: ${detail.message}`;
              }).join('; ');
          }
          detailedAdminError = `[Admin Gördü - Akış İçi Hata] AI modeli (${finalModelToUse}) gelen yanıt beklenen şemayla uyuşmuyor: ${zodErrors.substring(0, 800)}.`;
          if (errorDetails) {
              try { detailedAdminError += ` Raw Hata Detayları: ${JSON.stringify(errorDetails).substring(0,500)}`; } catch (e) { detailedAdminError += ` Raw Hata Detayları (Serileştirilemedi).`}
          }
      } else if (errorMessage.includes('SAFETY') || errorMessage.includes('block_reason')) {
          detailedAdminError = `[Admin Gördü - Akış İçi Hata] İçerik güvenlik filtrelerine takılmış olabilir. Model: ${finalModelToUse}. Detay: ${errorMessage.substring(0, 400)}`;
      }
      
      if (errorCause) {
          try { 
              const causeStr = typeof errorCause === 'string' ? errorCause : JSON.stringify(errorCause, Object.getOwnPropertyNames(errorCause));
              detailedAdminError += `Neden: ${causeStr.substring(0, 400)}. `; 
          } catch (e) { detailedAdminError += `Neden: (Serileştirilemedi). `; }
      }
      
      detailedAdminError += `Stack (kısmi): ${errorStack.substring(0, 600)}...`;
      
      const userVisibleMessage = enrichedInput.isAdmin ? detailedAdminError : GENERIC_USER_ERROR_MESSAGE;

      return {
          solution: userVisibleMessage,
          relatedConcepts: enrichedInput.isAdmin ? ["Hata (Akış İçi Yakalama)"] : [],
          examStrategyTips: [],
      };
    }
  }
);

    