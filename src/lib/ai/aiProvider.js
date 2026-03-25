import { trackAIUsage } from './observability.js';
import { callCencoriAI } from './cencori.js';
import { runSecurityChecks } from './cencori-security.js';
import { generateGeminiResponse } from './providers/gemini.js'; // Fallback provider
import { generateGroqResponse } from './providers/groq.js';   // Fallback provider

/**
 * Resilient AI Provider Layer (Step 2)
 * Centralizes primary Cencori execution with robust internal fallbacks.
 */
export async function generateAI({ userId, businessId, prompt, type = 'chat', model = 'gpt-4o-mini', systemInstruction = "" }) {
  
  // 1. PRE-PROCESSING SECURITY SCAN (Step 4)
  // Ensures safety before any tokens are sent to models.
  const secureInput = await runSecurityChecks(typeof prompt === 'string' ? prompt : prompt[prompt.length - 1].content);

  // Rebuild prompt/messages if it was an array
  const sanitizedPrompt = typeof prompt === 'string' 
    ? secureInput 
    : prompt.map((m, i) => i === prompt.length - 1 ? { ...m, content: secureInput } : m);

  // 2. EXECUTION WITH INTERNAL OBSERVABILITY (Step 2 & 7)
  return await trackAIUsage(
    { userId, businessId, requestType: type, provider: "cencori", model },
    async () => {
      try {
        // A. PRIMARY GATEWAY: CENCORI (Step 2)
        console.log(`📡 [AI-PROVIDER] Calling Cencori Gateway (${model})...`);
        const res = await callCencoriAI({ 
          prompt: sanitizedPrompt, 
          model, 
          metadata: { systemInstruction } 
        });
        
        return {
          ...res,
          providerUsed: "cencori"
        };
      } catch (err) {
        // B. SECONDARY FALLBACK: DIRECT PROVIDER (Step 2)
        // If Cencori Gateway is unreachable, we call providers directly.
        console.warn(`⚠️ [AI-PROVIDER] Cencori Gateway failed: ${err.message}. Falling back to direct provider...`);
        
        try {
          // Direct fallback to Groq or Gemini
          const fallbackRes = await generateGroqResponse(sanitizedPrompt, systemInstruction);
          return {
            ...fallbackRes,
            providerUsed: "groq (fallback)",
            fallbackUsed: true
          };
        } catch (fallbackErr) {
          console.error(`❌ [AI-PROVIDER] Primary Fallback failed. Trying Final Fallback (Gemini)...`);
          const finalRes = await generateGeminiResponse(sanitizedPrompt, systemInstruction);
          return {
            ...finalRes,
            providerUsed: "gemini (fallback)",
            fallbackUsed: true
          };
        }
      }
    }
  );
}
