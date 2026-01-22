import { supabase } from "@/lib/supabaseClient";
import type { KoreanQuizItem } from "./data";

export async function fetchKoreanQuizData(): Promise<KoreanQuizItem[]> {
  const { data, error } = await supabase
    .from("korean_quiz")
    .select("*")
    .order("number", { ascending: true });

  if (error) {
    console.error("Error fetching korean quiz data:", error);
    return [];
  }

  return data as KoreanQuizItem[];
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
