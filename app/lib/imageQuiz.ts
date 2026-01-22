import { supabase } from "@/lib/supabaseClient";
import type { ImageQuizItem, ImageQuizCategory } from "./data";

export async function fetchImageQuizByCategory(
  category: ImageQuizCategory
): Promise<ImageQuizItem[]> {
  const { data, error } = await supabase
    .from("image_quiz")
    .select("*")
    .eq("category", category)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching image quiz data:", error);
    return [];
  }

  return data as ImageQuizItem[];
}

export async function fetchAllImageQuiz(): Promise<ImageQuizItem[]> {
  const { data, error } = await supabase
    .from("image_quiz")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching image quiz data:", error);
    return [];
  }

  return data as ImageQuizItem[];
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const IMAGE_QUIZ_CATEGORIES = [
  {
    id: "street" as ImageQuizCategory,
    emoji: "🏁",
    title: "Street Survival",
    titleKo: "생존 길거리 한글",
    gradient: "from-red-500/20 to-orange-500/20",
    iconBg: "bg-gradient-to-br from-red-500 to-orange-600",
  },
  {
    id: "food" as ImageQuizCategory,
    emoji: "🍱",
    title: "K-Food Master",
    titleKo: "음식 & 메뉴판",
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconBg: "bg-gradient-to-br from-amber-500 to-yellow-500",
  },
  {
    id: "convenience" as ImageQuizCategory,
    emoji: "🏪",
    title: "Convenience Store",
    titleKo: "편의점 꿀템",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
  },
  {
    id: "history" as ImageQuizCategory,
    emoji: "🏰",
    title: "Time Travel",
    titleKo: "역사 & 명소",
    gradient: "from-purple-500/20 to-indigo-500/20",
    iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
  },
  {
    id: "kpop" as ImageQuizCategory,
    emoji: "🎤",
    title: "K-Vibe",
    titleKo: "연예 & 트렌드",
    gradient: "from-pink-500/20 to-fuchsia-500/20",
    iconBg: "bg-gradient-to-br from-pink-500 to-fuchsia-600",
  },
] as const;
