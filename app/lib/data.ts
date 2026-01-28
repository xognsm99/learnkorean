// app/lib/data.ts ✅ client-safe (fs/path 없음)

// Import JSON data
import jamoQuizJson from "@/app/data/jamo_quiz_24.json";
import emojiVocabJson from "@/app/data/emoji_vocab_100.json";
import interviewJson from "@/app/data/work_interview_20.json";

// Jamo Quiz Types (새 JSON 구조에 맞춤)
export type JamoItem = {
  glyph: string;
  name: string;
  en: string;
};

export type JamoQuizItem = {
  id: string;
  pool: "consonant" | "vowel";
  glyph: string;
  answer: string;
};

export type JamoQuizData = {
  meta: {
    version: string;
    mode: string;
    type: string;
    choicesCount: number;
  };
  pools: {
    consonant: JamoItem[];
    vowel: JamoItem[];
  };
  items: JamoQuizItem[];
};

export type EmojiVocabItem = {
  id: string;
  emoji: string;
  ko: string;
  en: string;
  category: string;
  level?: 1 | 2 | 3;
};

// Interview Types (새 JSON 구조에 맞춤)
export type InterviewCardItem = {
  id: string;
  mode: string;
  type: string;
  level: number;
  module: string;
  prompt: string;
  tts: string;
  extra: {
    sampleAnswerKo: string;
    keyPhrases: string[];
  };
  tags: string[];
};

export type InterviewItem = {
  id: string;
  q: string;
  a?: string;
  level?: number;
  category?: string;
};

// ✅ LearnHub.tsx가 찾는 export 이름 그대로 제공
export const jamoQuizData = jamoQuizJson as unknown as JamoQuizData;
export const emojiVocabData = emojiVocabJson as unknown as EmojiVocabItem[];
export const workInterviewData = interviewJson as unknown as InterviewCardItem[];

// (옵션) 기존에 emojiVocab / jamoQuiz 같은 이름도 쓰는 곳이 있으면 호환용으로 같이 export
export const jamoQuiz = jamoQuizData;
export const emojiVocab = emojiVocabData;
export const workInterview = workInterviewData;

// Korean Quiz Types (Supabase)
export type KoreanQuizItem = {
  id: number;
  number: number;
  question: string;
  question_en?: string; // English translation of question
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer_index: number; // 1-based (1, 2, 3, 4)
  rationale: string;
  hint: string;
};

// Image Quiz Types (Supabase)
export type ImageQuizCategory =
  | "street"      // 🏁 Street Survival
  | "food"        // 🍱 K-Food Master
  | "convenience" // 🏪 Convenience Store
  | "history"     // 🏰 Time Travel
  | "kpop";       // 🎤 K-Vibe

export type ImageQuizItem = {
  id: number;
  category: ImageQuizCategory;
  image_url: string;
  question: string;
  question_en?: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer_index: number; // 1-based (1, 2, 3, 4)
  rationale: string;
  rationale_en?: string;
  hint?: string;
  audio_path?: string; // Supabase Storage path for TTS audio
};

// Session Result Types (review 페이지용)
export type SessionResult = {
  lastMode: "jamo" | "emoji" | "interview" | "korean" | "image";
  correct: number;
  wrong: number;
  updatedAt: string;
};

const LS_KEY = "kw_last_session";

export function getSessionResult(): SessionResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionResult;
  } catch {
    return null;
  }
}
