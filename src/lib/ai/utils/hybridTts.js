import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

/**
 * PRODUCTION-READY Hybrid Multilingual TTS (ElevenLabs Optimized)
 * 
 * 1. ElevenLabs (Native/Human Quality) - Primary for Yoruba/Igbo.
 * 2. Google Translate Direct (Free) - Hausa/English.
 * 3. MsEdge Nigerian Neural (Free) - Universal Fallback.
 */
export async function generateHybridSpeech(text, detectedLanguage = 'english') {
  if (!text || typeof text !== 'string' || text.trim() === '') return null;

  const lang = (detectedLanguage || 'english').toLowerCase();
  const elKey = process.env.ELEVENLABS_API_KEY;

  // ─── TIER 1: ElevenLabs (Free Tier - Highest Native Quality) ───
  if (elKey && (lang === 'yoruba' || lang === 'igbo' || lang === 'hausa')) {
    try {
      console.log(`[TTS T1] ElevenLabs: ${lang}`);
      const audioBuffer = await queryElevenLabs(text, lang, elKey);
      if (audioBuffer && audioBuffer.length > 2000) {
         console.log(`[TTS T1] ✅ Success (${audioBuffer.length}B)`);
         return `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
      }
    } catch (e) {
      console.warn(`[TTS T1] ElevenLabs failed:`, e.message);
    }
  }

  // ─── TIER 2: Google Translate Direct (Free) ───
  const tier2 = await tryGoogleTranslateDirect(text, lang);
  if (tier2) return tier2;

  // ─── TIER 3: Nigerian Accent Fallback (Free) ───
  const tier3 = await tryMsEdgeNigerianAccent(text);
  if (tier3) return tier3;

  throw new Error('All TTS engines failed to generate audio.');
}

async function queryElevenLabs(text, lang, apiKey) {
  // Common Nigerian/Multi-language voice on ElevenLabs
  // 'Nig-Yoruba-Male' or 'Nig-Igbo-Female' - ElevenLabs detects lang automatically!
  // Pre-selected high-quality multilingual model: eleven_multilingual_v2
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/9BWtsRjCgsZCVvrvJvG9`, // 'Aria' Multilingual
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      }),
    }
  );

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const ab = await response.arrayBuffer();
  return Buffer.from(ab);
}

// --- Fallback Helpers ---

async function tryGoogleTranslateDirect(text, lang) {
  const codes = { 'yoruba': 'yo', 'igbo': 'ig', 'hausa': 'ha', 'english': 'en' };
  const tl = codes[lang] || 'en';
  if (tl === 'yo' || tl === 'ig') return null; // Google blocks these
  try {
    const buffer = await fetchGoogleTTS(text, tl);
    if (buffer && buffer.length > 2000) return `data:audio/mp3;base64,${buffer.toString('base64')}`;
    return null;
  } catch (e) { return null; }
}

async function tryMsEdgeNigerianAccent(text) {
  try {
    const voice = 'en-NG-AbeoNeural';
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const stream = tts.toStream(text);
    const chunks = [];
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => resolve(), 8000);
      stream.audioStream.on('data', c => chunks.push(c));
      stream.audioStream.on('end', () => { clearTimeout(timeout); resolve(); });
      stream.audioStream.on('error', reject);
    });
    const buffer = Buffer.concat(chunks);
    if (buffer && buffer.length > 2000) return `data:audio/mp3;base64,${buffer.toString('base64')}`;
    return null;
  } catch (e) { return null; }
}

async function fetchGoogleTTS(text, lang) {
  const chunks = text.length > 200 ? text.match(/.{1,200}/g) : [text];
  const buffers = [];
  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=gtx&q=${encodeURIComponent(chunk)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ab = await res.arrayBuffer();
    buffers.push(Buffer.from(ab));
  }
  return Buffer.concat(buffers);
}
