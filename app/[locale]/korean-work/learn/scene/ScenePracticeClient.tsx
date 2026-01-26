"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  if (!Array.isArray(arr)) return [];
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Extract answer INDEX for mcq/dialog (jsonb can be number, string, array, object)
// Note: answer_index from DB is 1-based, convert to 0-based for array access
function extractAnswerIndex(answer: unknown, choices?: unknown): number | null {
  // First check if choices object contains answer_index (nested structure)
  if (choices && typeof choices === "object" && !Array.isArray(choices)) {
    const choicesObj = choices as Record<string, unknown>;
    if ("answer_index" in choicesObj) {
      const idx = extractAnswerIndex(choicesObj.answer_index);
      // Convert 1-based to 0-based if it looks like 1-based (1-4 range)
      if (idx !== null && idx >= 1 && idx <= 4) {
        return idx - 1;
      }
      return idx;
    }
  }

  if (typeof answer === "number") {
    return answer;
  }
  if (typeof answer === "string") {
    const parsed = parseInt(answer, 10);
    return isNaN(parsed) ? null : parsed;
  }
  if (Array.isArray(answer) && answer.length > 0) {
    return extractAnswerIndex(answer[0]);
  }
  if (answer && typeof answer === "object") {
    const obj = answer as Record<string, unknown>;
    // Try various keys
    if ("index" in obj) return extractAnswerIndex(obj.index);
    if ("answerIndex" in obj) return extractAnswerIndex(obj.answerIndex);
    if ("answer_index" in obj) {
      const idx = extractAnswerIndex(obj.answer_index);
      // Convert 1-based to 0-based
      if (idx !== null && idx >= 1 && idx <= 4) {
        return idx - 1;
      }
      return idx;
    }
    if ("value" in obj) return extractAnswerIndex(obj.value);
    if ("answer" in obj) return extractAnswerIndex(obj.answer);
  }
  return null;
}

// Shuffle MCQ choices and return new choices + new correct index
function shuffleMcqChoices(
  choices: string[],
  originalCorrectIndex: number
): { shuffledChoices: string[]; newCorrectIndex: number } {
  // Create (text, originalIndex) pairs
  const pairs = choices.map((text, idx) => ({ text, originalIdx: idx }));

  // Shuffle the pairs
  const shuffledPairs = shuffle(pairs);

  // Extract shuffled choices
  const shuffledChoices = shuffledPairs.map((p) => p.text);

  // Find new position of the correct answer by originalIdx
  const newCorrectIndex = shuffledPairs.findIndex(
    (p) => p.originalIdx === originalCorrectIndex
  );

  return { shuffledChoices, newCorrectIndex };
}

// Extract answer STRING for fill/build types
function extractAnswerString(answer: unknown): string {
  if (typeof answer === "string") {
    return answer;
  }
  if (typeof answer === "number") {
    return String(answer);
  }
  if (Array.isArray(answer) && answer.length > 0) {
    return extractAnswerString(answer[0]);
  }
  if (answer && typeof answer === "object") {
    const obj = answer as Record<string, unknown>;
    if ("text" in obj && typeof obj.text === "string") {
      return obj.text;
    }
    if ("value" in obj && typeof obj.value === "string") {
      return obj.value;
    }
    if ("answer" in obj && typeof obj.answer === "string") {
      return obj.answer;
    }
  }
  return "";
}

// Safely extract choices array
function extractChoices(choices: unknown): string[] {
  if (!choices) return [];

  // Handle nested structure: { choices: [...], answer_index: N, ... }
  if (choices && typeof choices === "object" && !Array.isArray(choices)) {
    const obj = choices as Record<string, unknown>;
    if ("choices" in obj && Array.isArray(obj.choices)) {
      return extractChoices(obj.choices);
    }
  }

  if (Array.isArray(choices)) {
    return choices.map((c) => {
      if (typeof c === "string") return c;
      if (typeof c === "number") return String(c);
      if (c && typeof c === "object") {
        const obj = c as Record<string, unknown>;
        if ("text" in obj && typeof obj.text === "string") return obj.text;
        if ("value" in obj && typeof obj.value === "string") return obj.value;
        if ("label" in obj && typeof obj.label === "string") return obj.label;
      }
      return String(c);
    });
  }
  return [];
}

// Extract utterance (situation/context) from nested choices object
function extractUtterance(choices: unknown): string | null {
  if (choices && typeof choices === "object" && !Array.isArray(choices)) {
    const obj = choices as Record<string, unknown>;
    if ("utterance" in obj && typeof obj.utterance === "string" && obj.utterance) {
      // Convert escaped newlines back to actual newlines
      return obj.utterance.replace(/\\n/g, "\n");
    }
  }
  return null;
}

// Extract explanation from nested choices object
function extractExplanation(choices: unknown): string | null {
  if (choices && typeof choices === "object" && !Array.isArray(choices)) {
    const obj = choices as Record<string, unknown>;
    if ("explanation_ko" in obj && typeof obj.explanation_ko === "string" && obj.explanation_ko) {
      return obj.explanation_ko;
    }
  }
  return null;
}

export type TopicItem = {
  id: string;
  topic_id: string;
  type: string;
  prompt?: string | null;
  question?: string | null;
  choices?: unknown;
  answer?: unknown;
  level?: number | null;
  tags?: unknown;
  is_active?: boolean;
};

// Processed item with shuffled choices for MCQ/Dialog
type ProcessedItem = TopicItem & {
  shuffledChoices?: string[];
  shuffledCorrectIndex?: number;
};

type Props = {
  initialItems: TopicItem[];
  initialTopicId: string;
  topicTitle?: string;
  locale: string;
  group?: string;
};

const USER_ID = "demo"; // Temporary user ID

// Helper to determine item type
function getItemType(item: TopicItem): string {
  const t = item?.type?.toLowerCase() || "";
  if (t === "mcq" || t === "multiple_choice" || t === "mc") return "mcq";
  if (t === "fill" || t === "fill_blank" || t === "blank") return "fill";
  if (t === "build" || t === "sentence" || t === "arrange") return "build";
  if (t === "dialog" || t === "dialogue" || t === "conversation") return "dialog";
  return "mcq"; // default
}

// Process items: shuffle MCQ/Dialog choices once
function processItems(items: TopicItem[]): ProcessedItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const itemType = getItemType(item);

    // Only shuffle for mcq/dialog types
    if (itemType === "mcq" || itemType === "dialog") {
      const choices = extractChoices(item.choices);
      const originalCorrectIndex = extractAnswerIndex(item.answer, item.choices);

      if (choices.length > 0 && originalCorrectIndex !== null && originalCorrectIndex >= 0 && originalCorrectIndex < choices.length) {
        const { shuffledChoices, newCorrectIndex } = shuffleMcqChoices(choices, originalCorrectIndex);
        return {
          ...item,
          shuffledChoices,
          shuffledCorrectIndex: newCorrectIndex,
        };
      }
    }

    return item;
  });
}

export default function ScenePracticeClient({
  initialItems,
  initialTopicId,
  topicTitle,
  locale,
  group,
}: Props) {
  // Hydration fix: Don't shuffle on server, only on client
  const [sessionItems, setSessionItems] = useState<ProcessedItem[]>(initialItems);
  const [idx, setIdx] = useState(0);
  // For mcq/dialog: store selected INDEX
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [buildWords, setBuildWords] = useState<string[]>([]);

  // Process items (shuffle) only on client to avoid hydration mismatch
  useEffect(() => {
    setSessionItems(processItems(initialItems));
  }, [initialItems]);

  const currentItem = sessionItems[idx];
  const isFinished = idx >= sessionItems.length;
  const total = sessionItems.length;

  // Determine item type safely
  const itemType = useMemo(() => {
    if (!currentItem) return "mcq";
    return getItemType(currentItem);
  }, [currentItem]);

  // Extract choices safely - use shuffled if available
  const currentChoices = useMemo(() => {
    if (!currentItem) return [];
    // Use shuffled choices for mcq/dialog if available
    if ((itemType === "mcq" || itemType === "dialog") && currentItem.shuffledChoices) {
      return currentItem.shuffledChoices;
    }
    return extractChoices(currentItem.choices);
  }, [currentItem, itemType]);

  // For mcq/dialog: get correct answer INDEX - use shuffled index if available
  const correctIndex = useMemo(() => {
    if (itemType !== "mcq" && itemType !== "dialog") return null;
    // Use shuffled correct index if available
    if (currentItem?.shuffledCorrectIndex !== undefined) {
      return currentItem.shuffledCorrectIndex;
    }
    return extractAnswerIndex(currentItem?.answer, currentItem?.choices);
  }, [currentItem, itemType]);

  // For fill/build: get correct answer STRING
  const correctAnswerString = useMemo(() => {
    if (itemType === "mcq" || itemType === "dialog") return "";
    return extractAnswerString(currentItem?.answer);
  }, [currentItem, itemType]);

  // Check if choices are valid for mcq/dialog
  const hasValidChoices = useMemo(() => {
    // currentChoices is already extracted (handles both array and nested object structure)
    return currentChoices.length > 0;
  }, [currentChoices]);

  // Check if correctIndex is valid
  const hasValidCorrectIndex = useMemo(() => {
    if (itemType !== "mcq" && itemType !== "dialog") return true;
    return correctIndex !== null && correctIndex >= 0 && correctIndex < currentChoices.length;
  }, [itemType, correctIndex, currentChoices]);

  // Check answer correctness for fill/build
  const checkFillBuildAnswer = useCallback(
    (userAnswer: string): boolean => {
      if (!correctAnswerString) return false;
      const correct = correctAnswerString.toLowerCase().trim();
      const user = userAnswer.toLowerCase().trim();
      return correct === user;
    },
    [correctAnswerString]
  );

  // Submit handler
  const handleSubmit = async () => {
    if (submitted || !currentItem) return;

    let correct = false;
    let userAnswerForLog = "";

    if (itemType === "mcq" || itemType === "dialog") {
      // Index-based comparison
      if (correctIndex !== null && selectedIndex !== null) {
        correct = selectedIndex === correctIndex;
        userAnswerForLog = String(selectedIndex);
      }
    } else if (itemType === "fill") {
      correct = checkFillBuildAnswer(inputValue);
      userAnswerForLog = inputValue;
    } else if (itemType === "build") {
      const builtSentence = buildWords.join(" ");
      correct = checkFillBuildAnswer(builtSentence);
      userAnswerForLog = builtSentence;
    }

    setIsCorrect(correct);
    setShowResult(true);
    setSubmitted(true);

    if (correct) {
      setScore((s) => s + 1);
    }

    // Record attempt to Supabase (with error handling)
    try {
      await supabase.from("topic_attempts").insert({
        user_id: USER_ID,
        topic_id: initialTopicId,
        item_id: currentItem.id,
        is_correct: correct,
        chosen_answer: userAnswerForLog,
        created_at: new Date().toISOString(),
      });

      // Update progress
      await supabase.from("topic_progress").upsert(
        {
          user_id: USER_ID,
          topic_id: initialTopicId,
          correct_count: correct ? score + 1 : score,
          total_count: idx + 1,
          last_item_id: currentItem.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,topic_id" }
      );
    } catch (err) {
      console.error("Failed to record attempt:", err);
      // Don't break UX on error
    }
  };

  // Next question
  const handleNext = () => {
    setIdx((i) => i + 1);
    setSelectedIndex(null);
    setShowResult(false);
    setIsCorrect(false);
    setSubmitted(false);
    setInputValue("");
    setBuildWords([]);
  };

  // Restart session
  const handleRestart = () => {
    window.location.reload();
  };

  // Build type: shuffle choices for building sentence
  const shuffledBuildChoices = useMemo(() => {
    if (itemType !== "build") return [];
    return shuffle(currentChoices);
  }, [itemType, currentChoices]);

  // Back URL
  const backUrl = group
    ? `/${locale}/korean-work/learn/scene/${group}`
    : `/${locale}/korean-work/learn/scene`;

  // Check if we can submit - moved before early returns to avoid hook order issues
  const canSubmit = useMemo(() => {
    if (itemType === "mcq" || itemType === "dialog") {
      return selectedIndex !== null;
    }
    if (itemType === "fill") {
      return inputValue.trim().length > 0;
    }
    if (itemType === "build") {
      return buildWords.length > 0;
    }
    return true;
  }, [itemType, selectedIndex, inputValue, buildWords]);

  // Get correct answer text for display (mcq/dialog) - moved before early returns
  const correctAnswerText = useMemo(() => {
    if ((itemType === "mcq" || itemType === "dialog") && correctIndex !== null && currentChoices[correctIndex]) {
      return currentChoices[correctIndex];
    }
    return correctAnswerString;
  }, [itemType, correctIndex, currentChoices, correctAnswerString]);

  // Render result screen
  if (isFinished && total > 0) {
    const percentage = Math.round((score / total) * 100);
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="mx-auto w-full max-w-lg">
          <div
            className="
              rounded-3xl p-8
              bg-white/70 backdrop-blur-2xl
              border border-white/50
              shadow-2xl shadow-slate-900/10
              text-center
            "
          >
            <div className="text-6xl mb-4">
              {percentage >= 80 ? "🎉" : percentage >= 50 ? "👍" : "💪"}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Session Complete!
            </h2>
            <p className="text-slate-600 mb-6">
              You scored{" "}
              <span className="font-bold text-emerald-600">
                {score} / {total}
              </span>{" "}
              ({percentage}%)
            </p>

            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="
                  w-full py-3 px-6 rounded-2xl
                  bg-gradient-to-r from-emerald-500 to-teal-500
                  text-white font-semibold
                  shadow-lg shadow-emerald-500/30
                  hover:shadow-xl hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-200
                "
              >
                Try Again
              </button>
              <Link
                href={backUrl}
                className="
                  block w-full py-3 px-6 rounded-2xl
                  bg-white/60 backdrop-blur-xl
                  border border-white/40
                  text-slate-700 font-semibold
                  shadow-lg shadow-slate-900/5
                  hover:bg-white/80 hover:shadow-xl
                  transition-all duration-200
                  text-center
                "
              >
                Back to Topics
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No items or empty
  if (!currentItem || total === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="mx-auto w-full max-w-lg text-center">
          <div
            className="
              rounded-3xl p-8
              bg-white/70 backdrop-blur-2xl
              border border-white/50
              shadow-2xl shadow-slate-900/10
            "
          >
            <div className="text-5xl mb-4">📝</div>
            <p className="text-slate-500 mb-4">No practice items available.</p>
            <Link
              href={backUrl}
              className="
                inline-block py-3 px-6 rounded-2xl
                bg-gradient-to-r from-emerald-500 to-teal-500
                text-white font-semibold
                shadow-lg shadow-emerald-500/30
                hover:shadow-xl hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-200
              "
            >
              Back to Topics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {topicTitle || "Scene Practice"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Question {idx + 1} of {total}
            </p>
          </div>
          <Link
            href={backUrl}
            className="
              group flex items-center gap-2
              rounded-full px-5 py-2.5
              bg-white/60 backdrop-blur-xl
              border border-white/40
              shadow-lg shadow-slate-900/5
              text-sm font-semibold text-slate-700
              hover:bg-white/80 hover:shadow-xl
              transition-all duration-300
            "
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div
          className="
            rounded-3xl p-6
            bg-white/70 backdrop-blur-2xl
            border border-white/50
            shadow-2xl shadow-slate-900/10
          "
        >
          {/* Type badge */}
          <div className="mb-4">
            <span
              className={`
                inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase
                ${
                  itemType === "mcq"
                    ? "bg-blue-100 text-blue-700"
                    : itemType === "fill"
                      ? "bg-amber-100 text-amber-700"
                      : itemType === "build"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-pink-100 text-pink-700"
                }
              `}
            >
              {itemType === "mcq"
                ? "Multiple Choice"
                : itemType === "fill"
                  ? "Fill in the Blank"
                  : itemType === "build"
                    ? "Build Sentence"
                    : "Dialog"}
            </span>
          </div>

          {/* Utterance (situation/context) - Dialog or scene context */}
          {extractUtterance(currentItem.choices) && (
            <div className="mb-4 p-4 rounded-xl bg-slate-100 border border-slate-200">
              <p className="text-lg text-slate-700 whitespace-pre-line">
                {extractUtterance(currentItem.choices)}
              </p>
            </div>
          )}

          {/* Prompt (situation) - Main Korean question, larger and bolder */}
          {currentItem.prompt && (
            <div className="mb-3">
              <p className="text-xl font-bold text-slate-900 leading-relaxed">
                {currentItem.prompt}
              </p>
            </div>
          )}

          {/* Question - Secondary instruction, smaller and lighter */}
          <p className="text-sm text-slate-500 mb-6">
            {currentItem.question || "Choose the correct answer:"}
          </p>

          {/* MCQ/Dialog: choices validation error */}
          {(itemType === "mcq" || itemType === "dialog") && !hasValidChoices && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-amber-700 font-medium">문제 형식 오류</p>
              <p className="text-sm text-amber-600 mt-1">선택지가 올바르게 설정되지 않았습니다.</p>
            </div>
          )}

          {/* MCQ/Dialog: correct index validation error */}
          {(itemType === "mcq" || itemType === "dialog") && hasValidChoices && !hasValidCorrectIndex && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-amber-700 font-medium">정답 데이터 오류</p>
              <p className="text-sm text-amber-600 mt-1">정답 정보가 올바르게 설정되지 않았습니다.</p>
            </div>
          )}

          {/* MCQ/Dialog choices - only render if valid */}
          {(itemType === "mcq" || itemType === "dialog") &&
            hasValidChoices && hasValidCorrectIndex && (
              <div className="space-y-3">
                {currentChoices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelectedIndex(i)}
                    disabled={submitted}
                    className={`
                      w-full text-left p-4 rounded-xl
                      border-2 transition-all duration-200
                      ${
                        submitted
                          ? i === correctIndex
                            ? "border-emerald-500 bg-emerald-50"
                            : i === selectedIndex
                              ? "border-red-500 bg-red-50"
                              : "border-slate-200 bg-white"
                          : selectedIndex === i
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="font-medium text-slate-800">{choice}</span>
                  </button>
                ))}
              </div>
            )}

          {itemType === "fill" && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer..."
              className={`
                w-full p-4 rounded-xl border-2
                text-lg font-medium
                focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                transition-all duration-200
                ${
                  submitted
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-red-500 bg-red-50"
                    : "border-slate-200 bg-white"
                }
              `}
            />
          )}

          {itemType === "build" && (
            <div>
              {/* Built sentence display */}
              <div className="min-h-[60px] p-4 mb-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                {buildWords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {buildWords.map((word, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          !submitted &&
                          setBuildWords((w) => w.filter((_, idx) => idx !== i))
                        }
                        disabled={submitted}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-medium text-sm"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">
                    Click words below to build the sentence
                  </p>
                )}
              </div>

              {/* Word choices */}
              <div className="flex flex-wrap gap-2">
                {shuffledBuildChoices
                  .filter((w) => !buildWords.includes(w))
                  .map((word, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        !submitted && setBuildWords((w) => [...w, word])
                      }
                      disabled={submitted}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                    >
                      {word}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Result feedback */}
          {showResult && (
            <div
              className={`
                mt-6 p-4 rounded-xl
                ${isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}
              `}
            >
              <p
                className={`font-semibold ${isCorrect ? "text-emerald-700" : "text-red-700"}`}
              >
                {isCorrect ? "Correct! 🎉" : "Incorrect"}
              </p>
              {!isCorrect && correctAnswerText && (
                <p className="mt-1 text-sm text-slate-600">
                  Correct:{" "}
                  <span className="font-medium">{correctAnswerText}</span>
                </p>
              )}
              {/* Explanation */}
              {extractExplanation(currentItem.choices) && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-1">💡 해설</p>
                  <p className="text-sm text-slate-600">
                    {extractExplanation(currentItem.choices)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || ((itemType === "mcq" || itemType === "dialog") && (!hasValidChoices || !hasValidCorrectIndex))}
                className={`
                  w-full py-3 px-6 rounded-2xl
                  font-semibold
                  transition-all duration-200
                  ${
                    !canSubmit || ((itemType === "mcq" || itemType === "dialog") && (!hasValidChoices || !hasValidCorrectIndex))
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  }
                `}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="
                  w-full py-3 px-6 rounded-2xl
                  bg-gradient-to-r from-emerald-500 to-teal-500
                  text-white font-semibold
                  shadow-lg shadow-emerald-500/30
                  hover:shadow-xl hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-200
                "
              >
                {idx + 1 < total ? "Next Question" : "See Results"}
              </button>
            )}
          </div>
        </div>

        {/* Score display */}
        <div className="mt-4 text-center text-sm text-slate-500">
          Current score: {score} / {idx + (submitted ? 1 : 0)}
        </div>
      </div>
    </div>
  );
}
