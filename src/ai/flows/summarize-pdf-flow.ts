
'use server';

/**
 * @fileOverview Kullanıcının yüklediği PDF belgelerindeki konuları derinlemesine açıklayan,
 * anahtar fikirleri, ana fikri ve isteğe bağlı olarak sınav ipuçları ile örnek soruları içeren bir AI aracı.
 *
 * - summarizePdfForStudent - PDF içeriğini detaylı açıklama sürecini yöneten fonksiyon.
 * - SummarizePdfForStudentInput - summarizePdfForStudent fonksiyonu için giriş tipi.
 * - SummarizePdfForStudentOutput - summarizePdfForStudent fonksiyonu için dönüş tipi.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UserProfile } from '@/types';

const GENERIC_USER_ERROR_MESSAGE_PDF = "PDF Anlatıcısı şu anda bir sorun yaşıyor. Lütfen biraz sonra tekrar deneyin veya farklı bir dosya yüklemeyi deneyin.";

const DEFAULT_ERROR_OUTPUT_PDF_BASE = {
  keyPoints: ["Hata oluştu."],
  mainIdea: "İçerik işlenirken bir sorunla karşılaşıldı.",
  examTips: [],
  practiceQuestions: [],
};


const SummarizePdfForStudentInputSchema = z.object({
  pdfText: z.string().min(50, {message: "Lütfen en az 50 karakter içeren bir PDF metni sağlayın."}).describe('PDF belgesinden çıkarılan, en az 50 karakter içeren metin içeriği.'),
  summaryLength: z.enum(["short", "medium", "detailed"]).optional().default("medium").describe("İstenen açıklamanın uzunluğu: 'short' (ana hatlar), 'medium' (dengeli ve kapsamlı), 'detailed' (çok derinlemesine ve uzun)."),
  keywords: z.string().optional().describe("Açıklamanın odaklanması istenen, virgülle ayrılmış anahtar kelimeler."),
  pageRange: z.string().optional().describe("Açıklanacak sayfa aralığı, örn: '5-10'. AI, bu bilginin sağlandığı metin parçasına odaklanacaktır."),
  outputDetail: z.enum(["full", "key_points_only", "exam_tips_only", "questions_only"]).optional().default("full").describe("İstenen çıktı detayı: 'full' (tüm bölümler), 'key_points_only' (sadece anahtar noktalar), 'exam_tips_only' (sadece genel ipuçları), 'questions_only' (sadece örnek sorular)."),
  userPlan: z.enum(["free", "premium", "pro"]).describe("Kullanıcının mevcut üyelik planı."),
  customModelIdentifier: z.string().optional().describe("Adminler için özel model seçimi."),
  isAdmin: z.boolean().optional().describe("Kullanıcının admin olup olmadığını belirtir."),
});
export type SummarizePdfForStudentInput = z.infer<typeof SummarizePdfForStudentInputSchema>;

const SummarizePdfForStudentOutputSchema = z.object({
  summary: z.string().describe('Metindeki konunun, öğrencinin anlayışını en üst düzeye çıkaracak şekilde, AI tarafından oluşturulmuş, kapsamlı ve detaylı anlatımı. Bu birincil çıktıdır.'),
  keyPoints: z.array(z.string()).optional().describe('Konunun anlaşılması için en önemli noktaların madde işaretleri halinde listesi.'),
  mainIdea: z.string().optional().describe('Parçanın veya konunun ana fikri veya temel tezi.'),
  examTips: z.array(z.string()).optional().describe('Konuyla ilgili, genel çalışma veya anlama ipuçları (isteğe bağlı). YKS\'ye özel olmamalıdır.'),
  practiceQuestions: z.optional(z.array(z.object({
    question: z.string().describe("Konuyu test eden, düşündürücü soru."),
    options: z.array(z.string()).optional().describe("Çoktan seçmeli soru için seçenekler (genellikle 4 veya 5)."),
    answer: z.string().describe("Sorunun doğru cevabı (sadece harf veya seçenek metni)."),
    explanation: z.string().optional().describe("Doğru cevap için kısa ve net bir açıklama.")
  })).describe('İçeriğe dayalı, konuyu pekiştirmek için 2-3 alıştırma sorusu, cevap anahtarı ve açıklamalarıyla birlikte (isteğe bağlı).')),
  formattedStudyOutput: z.string().describe('Tüm istenen bölümleri (Detaylı Açıklama, Anahtar Noktalar, Ana Fikir, İpuçları, Alıştırma Soruları) net Markdown başlıkları ile içeren, doğrudan çalışma materyali olarak kullanılabilecek birleştirilmiş metin. Hata durumunda burası da hata mesajını içerecektir.')
});

export type SummarizePdfForStudentOutput = z.infer<typeof SummarizePdfForStudentOutputSchema>;

export async function summarizePdfForStudent(input: SummarizePdfForStudentInput): Promise<SummarizePdfForStudentOutput> {
  console.log(`[Summarize PDF Action] Entry. User input isAdmin: ${input.isAdmin}, User Plan: ${input.userPlan}, Custom Model (raw): '${input.customModelIdentifier}', PDF text length: ${input.pdfText?.length}`);
  let modelToUse: string;
  const adminModelChoice = input.customModelIdentifier;

  if (adminModelChoice && typeof adminModelChoice === 'string' && adminModelChoice.trim() !== "") {
    const customIdLower = adminModelChoice.toLowerCase().trim();
    console.log(`[Summarize PDF Action] Admin specified customModelIdentifier (processed): '${customIdLower}' from input: '${adminModelChoice}'`);
    switch (customIdLower) {
      case 'default_gemini_flash': modelToUse = 'googleai/gemini-2.0-flash'; break;
      case 'experimental_gemini_1_5_flash': modelToUse = 'googleai/gemini-1.5-flash-latest'; break;
      case 'experimental_gemini_2_5_flash_preview_05_20': modelToUse = 'googleai/gemini-2.5-flash-preview-05-20'; break;
      default:
        if (customIdLower.startsWith('googleai/')) {
            modelToUse = customIdLower;
            console.warn(`[Summarize PDF Action] Admin specified a direct Genkit model name: '${modelToUse}'. Ensure this model is supported.`);
        } else {
            console.warn(`[Summarize PDF Action] Admin specified an UNKNOWN customModelIdentifier: '${adminModelChoice}'. Falling back to universal default.`);
            modelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
        }
        break;
    }
  } else {
    console.log(`[Summarize PDF Action] No valid custom model specified. Using universal default 'googleai/gemini-2.5-flash-preview-05-20'.`);
    modelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
  }

  if (typeof modelToUse !== 'string' || !modelToUse.startsWith('googleai/')) {
      console.error(`[Summarize PDF Action] CRITICAL FALLBACK: modelToUse was invalid ('${modelToUse}', type: ${typeof modelToUse}). Defaulting to 'googleai/gemini-2.5-flash-preview-05-20'.`);
      modelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
  }
  console.log(`[Summarize PDF Action] Final model determined for flow: ${modelToUse}`);

  const enrichedInput: z.infer<typeof promptInputSchema> = { // Ensure type matches promptInputSchema
    ...input,
    isProUser: input.userPlan === 'pro',
    isPremiumUser: input.userPlan === 'premium',
    isCustomModelSelected: !!input.customModelIdentifier,
    isGemini25PreviewSelected: modelToUse === 'googleai/gemini-2.5-flash-preview-05-20',
    isAdmin: !!input.isAdmin,
  };

  try {
    const result = await summarizePdfForStudentFlow(enrichedInput, modelToUse);
    
    if (!result || typeof result.summary !== 'string' || typeof result.formattedStudyOutput !== 'string') {
        const errorDetail = !result ? "Flow tanımsız bir yanıt döndürdü." :
                            typeof result.summary !== 'string' ? "Açıklama (summary) eksik veya geçersiz." :
                            typeof result.formattedStudyOutput !== 'string' ? "Formatlanmış çıktı (formattedStudyOutput) eksik veya geçersiz." :
                            "Bilinmeyen yapısal hata.";
        console.error(`[Summarize PDF Action] Flow returned malformed output. Model: ${modelToUse}. Output Preview:`, JSON.stringify(result).substring(0,500));
        const adminError = `[Admin Gördü] AI Modeli (${modelToUse}) şemaya uymayan veya eksik bir yanıt döndürdü. Detay: ${errorDetail}. Raw Output: ${JSON.stringify(result).substring(0,300)}...`;
        const userError = GENERIC_USER_ERROR_MESSAGE_PDF;
        const finalErrorMessage = enrichedInput.isAdmin ? adminError : userError;

        return {
            summary: finalErrorMessage,
            ...DEFAULT_ERROR_OUTPUT_PDF_BASE,
            formattedStudyOutput: `## Hata\n\n${finalErrorMessage}`,
        };
    }
    console.log("[Summarize PDF Action] Successfully received result from summarizePdfForStudentFlow.");
    return result;
  } catch (error: any) {
    console.error(`[Summarize PDF Action] CRITICAL error during server action execution (outer try-catch). Admin Flag: ${enrichedInput.isAdmin}. Model: ${modelToUse}. Error:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    let errorMessage = 'Bilinmeyen bir sunucu hatası oluştu.';
    if (error instanceof Error) errorMessage = error.message;
    else if (typeof error === 'string') errorMessage = error;

    const adminOuterCatchError = `[Admin Gördü - Sunucu Aksiyonu Hatası] Model: ${modelToUse}. Detay: ${errorMessage.substring(0, 500)}`;
    const userOuterCatchError = GENERIC_USER_ERROR_MESSAGE_PDF;
    const finalErrorMessage = enrichedInput.isAdmin ? adminOuterCatchError : userOuterCatchError;
    return {
        summary: finalErrorMessage,
        ...DEFAULT_ERROR_OUTPUT_PDF_BASE,
        formattedStudyOutput: `## Hata\n\n${finalErrorMessage}`,
    };
  }
}

const promptInputSchema = SummarizePdfForStudentInputSchema.extend({
    isProUser: z.boolean().optional(),
    isPremiumUser: z.boolean().optional(),
    isCustomModelSelected: z.boolean().optional(),
    isGemini25PreviewSelected: z.boolean().optional(),
});

const prompt = ai.definePrompt({
  name: 'detailedTopicExplainerFromPdfPrompt',
  input: {schema: promptInputSchema},
  output: {schema: SummarizePdfForStudentOutputSchema},
  prompt: `Sen, sana sunulan akademik metinlerdeki konuları detaylı, kapsamlı ve anlaşılır bir şekilde açıklayan, alanında otorite sahibi bir AI konu uzmanısın. Amacın, metindeki bilgileri öğretmek, temel kavramları ve prensipleri sunmaktır. Cevapların Türkçe olmalıdır.
ÇIKTIN HER ZAMAN SummarizePdfForStudentOutputSchema ile tanımlanmış JSON formatına HARFİYEN UYMALIDIR. ASLA null veya tanımsız bir yanıt döndürme. Eğer bir hata oluşursa veya istenen bilgiyi üretemezsen bile, "summary", "keyPoints", "mainIdea", "examTips", "practiceQuestions" ve "formattedStudyOutput" alanlarını içeren geçerli bir JSON nesnesi döndür. Örneğin, "summary" alanına bir hata mesajı yazabilir, "keyPoints" alanını boş bir dizi ([]) olarak ayarlayabilirsin. İstenmeyen isteğe bağlı alanları (examTips, practiceQuestions, keyPoints, mainIdea) boş dizi veya tanımsız olarak bırakabilirsin, ancak "summary" ve "formattedStudyOutput" HER ZAMAN bir string içermelidir.

Kullanıcının üyelik planı: {{{userPlan}}}.
{{#if isAdmin}}
(Admin Kullanıcı Notu: Şu anda admin olarak test yapıyorsunuz. Model ve detay seviyesi seçimleriniz önceliklidir.)
{{/if}}
{{#if isProUser}}
(Pro Kullanıcı Notu: Bu Pro seviyesindeki kapsamlı konu anlatımı ve analizler, üyeliğinizin özel bir avantajıdır. Bu konu anlatımını en üst düzeyde akademik zenginlikle, konunun felsefi temellerine ve karmaşık detaylarına değinerek yap. Metindeki örtük bağlantıları ve çıkarımları vurgula. Örnek sorular bölümünde konuyu derinlemesine sorgulayan sorulara odaklan. Çok kapsamlı bir anlatım oluştur.)
{{else if isPremiumUser}}
(Premium Kullanıcı Notu: Açıklamalarını daha fazla örnekle ve önemli bağlantıları vurgulayarak zenginleştir. Örnek sorular bölümünde ise orta düzeyde, konuyu pekiştirici sorular sun.)
{{else}}
(Ücretsiz Kullanıcı Notu: Konunun ana hatlarını ve temel tanımlarını içeren, anlaşılır bir açıklama yap. Örnek sorular bölümünde temel düzeyde, hatırlamaya yönelik içerikler sun.)
{{/if}}

{{#if isCustomModelSelected}}
  {{#if customModelIdentifier}}
(Admin Notu: Özel model '{{{customModelIdentifier}}}' seçildi.)
  {{/if}}
{{/if}}

{{#if isGemini25PreviewSelected}}
(Gemini 2.5 Flash Preview 05-20 Modeli Notu: Yanıtların ÖZ ama ANLAŞILIR ve öğrenciye doğrudan fayda sağlayacak şekilde olsun. HIZLI yanıt vermeye odaklan. {{#if isProUser}}Pro kullanıcı için gereken derinliği ve stratejik bilgileri koruyarak{{else if isPremiumUser}}Premium kullanıcı için gereken detayları ve pratik ipuçlarını sağlayarak{{/if}} gereksiz uzun açıklamalardan ve süslemelerden kaçın, doğrudan konuya girerek en kritik bilgileri vurgula. Çıktın HER ZAMAN geçerli bir JSON nesnesi olmalıdır.)
{{/if}}

PDF'den çıkarılan metin verildiğinde, {{{summaryLength}}} uzunluk tercihine, {{{outputDetail}}} çıktı detayı isteğine ve varsa {{{keywords}}} veya {{{pageRange}}} bilgilerine göre, ÖĞRENCİ DOSTU ve GENEL AKADEMİK bir tonda aşağıdaki görevleri yerine getir. YKS'ye özel sınav ipuçları, stratejiler veya YKS bağlantıları KURMA. Çıktını, belirtilen şemaya harfiyen uyacak şekilde yapılandır.

Özel İstekler:
{{#if keywords}}- Odaklanılacak Anahtar Kelimeler: {{{keywords}}}{{/if}}
{{#if pageRange}}- Odaklanılacak Sayfa Aralığı (Kavramsal): {{{pageRange}}}{{/if}}

İstenen Çıktı Detayı: {{{outputDetail}}}

İstenen Çıktı Bölümleri (JSON formatına uygun olarak):
1.  **summary (string, zorunlu)**: Metindeki konuyu, {{{summaryLength}}} seçeneğine göre detay seviyesini ayarlayarak açıkla.
    *   'short': Konunun ana hatlarını ve temel tanımlarını birkaç paragrafta açıkla.
    *   'medium': Ana argümanları, önemli alt başlıkları, temel ilkeleri ve birkaç açıklayıcı örneği içeren kapsamlı bir anlatım sun.
    *   'detailed': Metnin tüm önemli yönlerini, alt başlıklarını derinlemesine, karmaşık örnekleri, diğer konularla bağlantılarını içerecek şekilde son derece uzun ve kapsamlı bir anlatım oluştur.
    Paragraflar halinde yaz ve Markdown formatlamasını (başlıklar, listeler, vurgular) kullan. Eğer bir anlatım üretemiyorsan, bu alana bir hata mesajı yaz. BU ALAN ASLA BOŞ BIRAKILMAMALI.
2.  **keyPoints (string dizisi, isteğe bağlı)**: Anlatılan konunun en önemli 3-5 maddesini listele. 'outputDetail' farklıysa veya üretemiyorsan, bu bölümü boş bir dizi ([]) olarak ayarla.
3.  **mainIdea (string, isteğe bağlı)**: Konunun veya metnin temel mesajını tek cümleyle ifade et. Eğer bir ana fikir belirleyemiyorsan, bu alanı boş bırak veya "Ana fikir belirlenemedi." yaz.
4.  **examTips (string dizisi, isteğe bağlı)**: Eğer 'outputDetail' 'full' veya 'exam_tips_only' ise, metinden konuyu ANLAMAYA YÖNELİK genel 2-4 ipucu belirt. Bunlar YKS\'ye özel olmamalıdır (örn: "Bu konuyu daha iyi anlamak için X kavramına odaklanın.", "Karmaşık formülleri parçalara ayırarak öğrenin."). Yoksa veya üretemiyorsan, bu alanı boş bir dizi ([]) olarak ayarla.
5.  **practiceQuestions (isteğe bağlı, Question nesneleri dizisi)**: Eğer 'outputDetail' 'questions_only' veya 'full' ise ve içerik uygunsa, 2-3 genel, konuyu pekiştirmek için alıştırma sorusu (seçenekler, doğru cevap, açıklama) oluştur. Bunlar YKS formatında olmak zorunda değildir. Uygun değilse veya üretemiyorsan, bu alanı boş bir dizi ([]) olarak ayarla.
6.  **formattedStudyOutput (string, zorunlu)**: Yukarıdaki istenen bölümleri ({{{outputDetail}}} seçeneğine göre) net Markdown başlıkları ile tek bir dizede birleştir. Örn: "## Detaylı Konu Anlatımı", "## Anahtar Noktalar" vb. Eğer 'outputDetail' örneğin 'key_points_only' ise, formattedStudyOutput sadece "## Anahtar Noktalar" başlığını ve içeriğini içermelidir. Eğer genel bir hata oluştuysa, bu alana da bir hata mesajı yaz. BU ALAN ASLA BOŞ BIRAKILMAMALI.

Hedefin öğrencinin konuyu derinlemesine anlamasına yardımcı olmak. YKS'YE ÖZEL İFADELER KULLANMA. {{{summaryLength}}} 'detailed' ise cömert ol.
HER ZAMAN ŞEMAYA UYGUN BİR JSON NESNESİ DÖNDÜR. "summary" ve "formattedStudyOutput" alanları her zaman bir string içermelidir.

İşlenecek Metin:
{{{pdfText}}}`,
});

const summarizePdfForStudentFlow = ai.defineFlow(
  {
    name: 'summarizePdfForStudentFlow',
    inputSchema: promptInputSchema,
    outputSchema: SummarizePdfForStudentOutputSchema,
  },
  async (enrichedInput: z.infer<typeof promptInputSchema>, modelToUseParam: string ): Promise<SummarizePdfForStudentOutput> => {
    let finalModelToUse = modelToUseParam;
    console.log(`[Summarize PDF Flow] Entry. Admin Flag from enrichedInput: ${enrichedInput.isAdmin}, User Plan: ${enrichedInput.userPlan}, Custom Model (raw): '${enrichedInput.customModelIdentifier}', Model to use initially: ${finalModelToUse}`);

    if (typeof finalModelToUse !== 'string' || !finalModelToUse.startsWith('googleai/')) {
        console.warn(`[Summarize PDF Flow] Invalid or non-string modelToUseParam ('${finalModelToUse}', type: ${typeof finalModelToUse}) received. Defaulting to universal 'googleai/gemini-2.5-flash-preview-05-20'.`);
        finalModelToUse = 'googleai/gemini-2.5-flash-preview-05-20';
    }
    console.log(`[Summarize PDF Flow] Corrected/Final model INSIDE FLOW to: ${finalModelToUse}`);
    
    const standardTemperature = 0.6;
    const standardSafetySettings = [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ];
    
    let maxOutputTokens = 4096; 
    if (enrichedInput.summaryLength === 'detailed') maxOutputTokens = 8192;
    else if (enrichedInput.summaryLength === 'short') maxOutputTokens = 2048;
    
    if (enrichedInput.isProUser && enrichedInput.summaryLength === 'detailed') maxOutputTokens = 8192; 
    else if (enrichedInput.isProUser) maxOutputTokens = Math.max(maxOutputTokens, 4096);

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
    
    const loggableEnrichedInput = {...enrichedInput, pdfText: enrichedInput.pdfText ? `PDF text provided (length: ${enrichedInput.pdfText.length})` : undefined};
    console.log(`[Summarize PDF Flow] Calling prompt with model: ${finalModelToUse} and options:`, JSON.stringify(callOptions.config), `for user plan: ${enrichedInput.userPlan}, customModel (raw): ${enrichedInput.customModelIdentifier}, isAdmin: ${enrichedInput.isAdmin}`);
    console.log(`[Summarize PDF Flow] Input to prompt (loggableEnrichedInput):`, JSON.stringify(loggableEnrichedInput).substring(0, 1000) + (JSON.stringify(loggableEnrichedInput).length > 1000 ? "..." : ""));

    try {
      const {output} = await prompt(loggableEnrichedInput, callOptions); // Use loggableEnrichedInput for the prompt call

      if (output === null || typeof output !== 'object' || typeof output.summary !== 'string' || output.summary.trim().length === 0 || typeof output.formattedStudyOutput !== 'string' || output.formattedStudyOutput.trim().length === 0) {
        const rawOutputPreview = output === null ? "null" : (JSON.stringify(output, null, 2).substring(0, 500) + "...");
        console.error(`[Summarize PDF Flow] AI returned null or malformed/empty output. Model: ${finalModelToUse}. Output Preview:`, rawOutputPreview, `isAdmin: ${enrichedInput.isAdmin}`);
        
        let errorReason = "bilinmeyen bir nedenle";
        if (output === null) errorReason = "model boş bir yanıt ('null') döndürdü";
        else if (typeof output !== 'object') errorReason = "model beklenen nesne yapısında bir yanıt döndürmedi";
        else if (typeof output.summary !== 'string' || output.summary.trim().length === 0) errorReason = "modelin döndürdüğü 'summary' alanı boş veya geçersiz";
        else if (typeof output.formattedStudyOutput !== 'string' || output.formattedStudyOutput.trim().length === 0) errorReason = "modelin döndürdüğü 'formattedStudyOutput' alanı boş veya geçersiz";
        
        const adminErrorMessage = `[Admin Gördü - Akış İçi Hata] AI Modeli (${finalModelToUse}), beklenen yanıt şemasına uymayan bir çıktı üretti çünkü ${errorReason}. Raw output: ${rawOutputPreview}`;
        const userErrorMessage = GENERIC_USER_ERROR_MESSAGE_PDF;
        const finalErrorMessage = enrichedInput.isAdmin ? adminErrorMessage : userErrorMessage;

        return {
            summary: finalErrorMessage,
            ...DEFAULT_ERROR_OUTPUT_PDF_BASE,
            formattedStudyOutput: `## Hata\n\n${finalErrorMessage}`
        };
      }
      
      // Ensure optional arrays are present if requested, otherwise make them undefined for schema
      const shouldHaveQuestions = enrichedInput.outputDetail === 'full' || enrichedInput.outputDetail === 'questions_only';
      output.practiceQuestions = shouldHaveQuestions ? (output.practiceQuestions || []) : undefined;

      const shouldHaveExamTips = enrichedInput.outputDetail === 'full' || enrichedInput.outputDetail === 'exam_tips_only';
      output.examTips = shouldHaveExamTips ? (output.examTips || []) : undefined;

      if (enrichedInput.outputDetail !== 'full' && enrichedInput.outputDetail !== 'key_points_only') {
          output.keyPoints = undefined; // Make undefined if not requested
      } else {
          output.keyPoints = output.keyPoints || []; // Ensure it's an array if requested and present, or empty array
      }
       if (enrichedInput.outputDetail !== 'full' && enrichedInput.outputDetail !== 'main_idea_only' /* Placeholder, not a real option */) {
          // output.mainIdea is already optional. If not full, it might or might not be there based on other details.
          // For simplicity, if not explicitly asked by a "main_idea_only" like flag, let it be as is.
      } else {
           output.mainIdea = output.mainIdea || undefined;
      }
      
      console.log("[Summarize PDF Flow] Successfully received and validated output from AI model.");
      return output;

    } catch (promptError: any) {
        console.error(`[Summarize PDF Flow] INNER CATCH: CRITICAL ERROR during prompt execution with model ${finalModelToUse}. Admin Flag: ${enrichedInput.isAdmin}. Error details:`, JSON.stringify(promptError, Object.getOwnPropertyNames(promptError), 2));

        let detailedAdminErrorForLog = `Genkit/AI Hatası: ${promptError?.name || 'Bilinmeyen Hata Adı'} - ${promptError?.message || 'Hata mesajı yok.'}. `;
        if (promptError?.cause) {
            try { detailedAdminErrorForLog += `Neden: ${JSON.stringify(promptError.cause)}. `; }
            catch (e) { detailedAdminErrorForLog += `Neden: (Serileştirilemedi). `; }
        }
        if (promptError?.details) { 
            try { detailedAdminErrorForLog += `Detaylar: ${JSON.stringify(promptError.details)}. `; }
            catch (e) { detailedAdminErrorForLog += `Detaylar: (Serileştirilemedi). `; }
        }
        
        if (promptError?.name === 'GenkitError' && promptError?.message?.includes('Schema validation failed')) {
            let zodErrors = "Şema Doğrulama Hatası.";
            if (promptError.details && Array.isArray(promptError.details)) {
                zodErrors = promptError.details.map((detail: any) => `[${detail.path?.join('.') || 'root'}]: ${detail.message}`).join('; ');
            }
            detailedAdminErrorForLog = `AI modeli (${finalModelToUse}) gelen yanıt beklenen şemayla uyuşmuyor: ${zodErrors.substring(0, 400)}. Raw Prompt Error Details: ${JSON.stringify(promptError.details).substring(0,300)}`;
        } else if (promptError?.message?.includes('SAFETY') || promptError?.message?.includes('block_reason')) {
            detailedAdminErrorForLog = `İçerik güvenlik filtrelerine takılmış olabilir. Model: ${finalModelToUse}. Detay: ${promptError.message.substring(0, 200)}`;
        }

        const userVisibleMessage = enrichedInput.isAdmin
            ? `[Admin Gördü - Akış İçi Hata] AI PDF Anlatıcısı (${finalModelToUse}) bir hata ile karşılaştı. Detay: ${detailedAdminErrorForLog.substring(0,1000)}`
            : GENERIC_USER_ERROR_MESSAGE_PDF;

        return {
            summary: userVisibleMessage,
            ...DEFAULT_ERROR_OUTPUT_PDF_BASE,
            formattedStudyOutput: `## Hata\n\n${userVisibleMessage}`,
        };
    }
  }
);

