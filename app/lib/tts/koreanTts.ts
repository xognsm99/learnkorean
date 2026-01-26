/**
 * Korean TTS utilities using browser SpeechSynthesis API
 */

// Jamo to natural reading mapping
const JAMO_MAP: Record<string, string> = {
  // Vowels
  "ㅏ": "아",
  "ㅑ": "야",
  "ㅓ": "어",
  "ㅕ": "여",
  "ㅗ": "오",
  "ㅛ": "요",
  "ㅜ": "우",
  "ㅠ": "유",
  "ㅡ": "으",
  "ㅣ": "이",
  "ㅐ": "애",
  "ㅔ": "에",
  "ㅒ": "얘",
  "ㅖ": "예",
  "ㅘ": "와",
  "ㅙ": "왜",
  "ㅚ": "외",
  "ㅝ": "워",
  "ㅞ": "웨",
  "ㅟ": "위",
  "ㅢ": "의",
  // Basic consonants
  "ㄱ": "기역",
  "ㄴ": "니은",
  "ㄷ": "디귿",
  "ㄹ": "리을",
  "ㅁ": "미음",
  "ㅂ": "비읍",
  "ㅅ": "시옷",
  "ㅇ": "이응",
  "ㅈ": "지읒",
  "ㅊ": "치읓",
  "ㅋ": "키읔",
  "ㅌ": "티읕",
  "ㅍ": "피읖",
  "ㅎ": "히읗",
  // Double consonants
  "ㄲ": "쌍기역",
  "ㄸ": "쌍디귿",
  "ㅃ": "쌍비읍",
  "ㅆ": "쌍시옷",
  "ㅉ": "쌍지읒",
};

/**
 * Convert jamo symbol to natural Korean reading for TTS
 * If not a jamo symbol, returns the original text
 */
export function getKoreanSpeakText(input: string): string {
  if (!input) return "";

  // If it's a single jamo character, use the mapping
  if (input.length === 1 && JAMO_MAP[input]) {
    return JAMO_MAP[input];
  }

  // Otherwise return as-is (already a syllable or regular text)
  return input;
}

/**
 * Stop any currently playing Korean speech
 */
export function stopKoreanSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speak Korean text using browser TTS
 * Automatically cancels any previous utterance
 */
export function speakKorean(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("SpeechSynthesis not supported");
    return;
  }

  // Cancel any previous speech
  stopKoreanSpeech();

  const speakText = getKoreanSpeakText(text);
  const utterance = new SpeechSynthesisUtterance(speakText);

  utterance.lang = "ko-KR";
  utterance.rate = 0.9; // Slightly slower for learning
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find a Korean voice
  const voices = window.speechSynthesis.getVoices();
  const koreanVoice = voices.find(
    (voice) => voice.lang.startsWith("ko") || voice.lang.includes("Korean")
  );

  if (koreanVoice) {
    utterance.voice = koreanVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Check if TTS is available in the browser
 */
export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Speak Korean text multiple times with intervals
 * @param text - Text to speak
 * @param times - Number of times to repeat (default: 3)
 * @param intervalMs - Interval between repetitions in ms (default: 1200)
 */
/**
 * Speak a Korean word (for vocab/emoji quiz)
 * Unlike jamo, words are spoken as-is without mapping
 * @param word - Korean word to speak (e.g., "사과")
 * @param repeat - Number of times to speak (1 or 3, default: 1)
 */
export function speakKoreanWord(word: string, repeat: 1 | 3 = 1): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("SpeechSynthesis not supported");
    return;
  }

  // Cancel any previous speech
  stopKoreanSpeech();

  if (repeat === 1) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "ko-KR";
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(
      (voice) => voice.lang.startsWith("ko") || voice.lang.includes("Korean")
    );
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    // repeat === 3
    let count = 0;
    const speakOnce = () => {
      if (count >= 3) return;

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "ko-KR";
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find(
        (voice) => voice.lang.startsWith("ko") || voice.lang.includes("Korean")
      );
      if (koreanVoice) {
        utterance.voice = koreanVoice;
      }

      utterance.onend = () => {
        count++;
        if (count < 3) {
          setTimeout(speakOnce, 800);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakOnce();
  }
}

export function speakKoreanRepeat(
  text: string,
  times: number = 3,
  intervalMs: number = 1200
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("SpeechSynthesis not supported");
    return;
  }

  // Cancel any previous speech
  stopKoreanSpeech();

  const speakText = getKoreanSpeakText(text);
  let count = 0;

  const speakOnce = () => {
    if (count >= times) return;

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = "ko-KR";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a Korean voice
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(
      (voice) => voice.lang.startsWith("ko") || voice.lang.includes("Korean")
    );

    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    utterance.onend = () => {
      count++;
      if (count < times) {
        setTimeout(speakOnce, intervalMs);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  speakOnce();
}
