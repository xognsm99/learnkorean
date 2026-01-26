"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { JamoQuizData, JamoQuizItem, JamoItem } from "@/app/lib/data";
import {
  type JamoGameLevel,
  type QuizWithChoices,
  shuffle,
  generateLevel2QuizSet,
  generateLevel3QuizSet,
} from "@/app/lib/jamo";
import {
  speakKoreanRepeat,
  stopKoreanSpeech,
  getKoreanSpeakText,
} from "@/app/lib/tts/koreanTts";

interface JamoModeProps {
  data: JamoQuizData;
  onSession: (correct: number, wrong: number) => void;
}

/** 레벨별 문제 수 */
const QUIZ_COUNT_PER_LEVEL = {
  1: 29, // 14 기본자음 + 5 쌍자음 + 10 모음
  2: 15,
  3: 15,
} as const;

export default function JamoMode({ data, onSession }: JamoModeProps) {
  const [level, setLevel] = useState<JamoGameLevel>(1);
  const [pos, setPos] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // TTS state
  const [ttsText, setTtsText] = useState("");
  const [ttsRepeat, setTtsRepeat] = useState<1 | 3>(1);

  // 레벨1: 기존 자모 문제 (셔플된 인덱스)
  const shuffledLevel1Order = useMemo(
    () => shuffle(data.items.map((_, i) => i)),
    [data.items]
  );

  // 레벨2/3: 조합 문제 세트
  const [level2Quizzes, setLevel2Quizzes] = useState<QuizWithChoices[]>([]);
  const [level3Quizzes, setLevel3Quizzes] = useState<QuizWithChoices[]>([]);

  // 레벨 변경 시 문제 세트 초기화
  useEffect(() => {
    if (level === 2 && level2Quizzes.length === 0) {
      setLevel2Quizzes(generateLevel2QuizSet(QUIZ_COUNT_PER_LEVEL[2]));
    } else if (level === 3 && level3Quizzes.length === 0) {
      setLevel3Quizzes(generateLevel3QuizSet(QUIZ_COUNT_PER_LEVEL[3]));
    }
  }, [level, level2Quizzes.length, level3Quizzes.length]);

  // 현재 레벨의 총 문제 수
  const total = useMemo(() => {
    if (level === 1) return data.items.length;
    if (level === 2) return level2Quizzes.length || QUIZ_COUNT_PER_LEVEL[2];
    return level3Quizzes.length || QUIZ_COUNT_PER_LEVEL[3];
  }, [level, data.items.length, level2Quizzes.length, level3Quizzes.length]);

  // 현재 문제 데이터
  const currentQuizData = useMemo(() => {
    if (level === 1) {
      const currentIndex = shuffledLevel1Order[pos];
      const currentItem = data.items[currentIndex];
      return {
        type: "level1" as const,
        item: currentItem,
        pool: currentItem?.pool,
        glyph: currentItem?.glyph,
        answer: currentItem?.answer,
        prompt: currentItem?.glyph,
        questionText: "What is this letter called?",
      };
    } else if (level === 2) {
      const quiz = level2Quizzes[pos];
      return {
        type: "level2" as const,
        item: quiz,
        prompt: quiz?.prompt,
        answer: quiz?.answer,
        choices: quiz?.choices,
        questionText: "What syllable is this?",
      };
    } else {
      const quiz = level3Quizzes[pos];
      return {
        type: "level3" as const,
        item: quiz,
        prompt: quiz?.prompt,
        answer: quiz?.answer,
        choices: quiz?.choices,
        questionText: "What syllable is this?",
      };
    }
  }, [level, pos, shuffledLevel1Order, data.items, level2Quizzes, level3Quizzes]);

  // 레벨1 선택지 생성
  const generateLevel1Choices = useCallback(
    (item: JamoQuizItem): string[] => {
      const pool: JamoItem[] = data.pools[item.pool];
      const choicesCount = data.meta.choicesCount;
      const correctAnswer = item.answer;

      const wrongAnswers = pool
        .filter((p) => p.name !== correctAnswer)
        .map((p) => p.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, choicesCount - 1);

      return shuffle([correctAnswer, ...wrongAnswers]);
    },
    [data]
  );

  // 선택지 업데이트
  useEffect(() => {
    if (!currentQuizData.item) return;

    if (level === 1) {
      const newChoices = generateLevel1Choices(currentQuizData.item as JamoQuizItem);
      setChoices(newChoices);
    } else {
      setChoices((currentQuizData as { choices?: string[] }).choices || []);
    }
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, [level, currentQuizData, generateLevel1Choices]);

  // 레벨 변경 핸들러
  const handleLevelChange = (newLevel: JamoGameLevel) => {
    if (newLevel === level) return;

    // Stop TTS and reset state
    stopKoreanSpeech();
    setTtsText("");

    setLevel(newLevel);
    setPos(0);
    setCorrect(0);
    setWrong(0);
    setSelectedAnswer(null);
    setIsCorrect(null);

    if (newLevel === 2) {
      setLevel2Quizzes(generateLevel2QuizSet(QUIZ_COUNT_PER_LEVEL[2]));
    } else if (newLevel === 3) {
      setLevel3Quizzes(generateLevel3QuizSet(QUIZ_COUNT_PER_LEVEL[3]));
    }
  };

  // 답변 처리
  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;

    const isAnswerCorrect = answer === currentQuizData.answer;

    setSelectedAnswer(answer);
    setIsCorrect(isAnswerCorrect);

    const newCorrect = isAnswerCorrect ? correct + 1 : correct;
    const newWrong = isAnswerCorrect ? wrong : wrong + 1;

    // Set TTS text for listening (both correct and wrong - to learn the answer)
    // For Level 1: use prompt (jamo glyph like "ㄱ")
    // For Level 2/3: use answer (syllable like "랴") - NOT the formula "ㄹ + ㅑ"
    const textToSpeak = level === 1
      ? (currentQuizData.prompt || "")
      : (currentQuizData.answer || "");
    setTtsText(textToSpeak);

    if (isAnswerCorrect) {
      setCorrect(newCorrect);
    } else {
      setWrong(newWrong);
    }

    onSession(newCorrect, newWrong);
  };

  // 다음 문제로 이동
  const handleNext = () => {
    if (pos < total - 1) {
      stopKoreanSpeech();
      setTtsText("");
      setPos((prev) => prev + 1);
    }
  };

  const progress = ((pos + 1) / total) * 100;
  const isComplete = pos === total - 1 && selectedAnswer !== null;

  // 완료 화면
  if (isComplete) {
    return (
      <div className="space-y-6">
        <LevelSelector level={level} onLevelChange={handleLevelChange} />

        <div className="text-center py-8">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete!</h2>
          <p className="text-slate-600 mb-6">
            {correct} correct / {wrong} incorrect
          </p>
          <div className="text-4xl font-bold text-slate-900 mb-2">
            {Math.round((correct / total) * 100)}%
          </div>
          <p className="text-sm text-slate-500 mb-6">Accuracy</p>

          <button
            type="button"
            className="
              py-3 px-6 rounded-2xl
              bg-gradient-to-r from-violet-500 to-purple-600
              text-white font-semibold
              shadow-lg shadow-violet-500/25
              hover:shadow-xl hover:shadow-violet-500/30
              active:scale-95
              transition-all
            "
            onClick={() => handleLevelChange(level)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 로딩
  if (!currentQuizData.item) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LevelSelector level={level} onLevelChange={handleLevelChange} />

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">
            {pos + 1} / {total}
          </span>
          <span className="text-slate-500">
            Correct {correct} | Wrong {wrong}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quiz Card */}
      <div className="text-center py-8">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
          {level === 1
            ? (currentQuizData.pool === "consonant" ? "Consonant" : "Vowel")
            : level === 2
            ? "Initial + Vowel"
            : "Initial + Vowel + Final"}
        </div>

        <div className={`font-bold leading-none mb-8 ${
          level === 1 ? "text-[120px]" : "text-[72px]"
        }`}>
          {currentQuizData.prompt}
        </div>

        <p className="text-lg text-slate-600 mb-8">{currentQuizData.questionText}</p>

        {/* Choices */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {choices.map((choice) => {
            let buttonClass =
              "w-full py-4 px-6 rounded-2xl border-2 text-lg font-semibold transition-all";

            if (selectedAnswer !== null) {
              if (choice === currentQuizData.answer) {
                buttonClass += " bg-emerald-50 border-emerald-500 text-emerald-700";
              } else if (choice === selectedAnswer && !isCorrect) {
                buttonClass += " bg-rose-50 border-rose-500 text-rose-700";
              } else {
                buttonClass += " bg-slate-50 border-slate-200 text-slate-400";
              }
            } else {
              buttonClass +=
                " bg-white border-slate-200 text-slate-900 hover:border-violet-400 hover:bg-violet-50";
            }

            return (
              <button
                key={choice}
                type="button"
                className={buttonClass}
                onClick={() => handleAnswer(choice)}
                disabled={selectedAnswer !== null}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result feedback */}
      {selectedAnswer !== null && (
        <div
          className={`text-center py-3 px-4 rounded-2xl ${
            isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          <p className="font-semibold">
            {isCorrect ? "Correct! 🎉" : `Wrong! The answer is: ${currentQuizData.answer}`}
          </p>

          {/* Action buttons - mobile optimized */}
          <div className="mt-4 flex items-stretch gap-2">
            {/* TTS Listen Button */}
            {ttsText && (
              <button
                type="button"
                onClick={() => speakKoreanRepeat(ttsText, ttsRepeat, 1000)}
                className={`
                  flex-1 inline-flex items-center justify-center gap-1
                  py-2.5 px-2 rounded-xl
                  bg-white/80 backdrop-blur
                  font-semibold text-sm
                  active:scale-[0.98]
                  transition-all
                  min-w-0
                  ${isCorrect
                    ? "border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    : "border-2 border-rose-300 text-rose-700 hover:bg-rose-100"
                  }
                `}
              >
                <span>🔊</span>
                <span className="truncate">
                  {level === 1
                    ? `Listen (${getKoreanSpeakText(ttsText)})`
                    : `Listen "${ttsText}"`
                  }
                </span>
              </button>
            )}

            {/* Repeat Toggle */}
            {ttsText && (
              <div className="flex items-center bg-white/60 backdrop-blur rounded-xl p-1 border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setTtsRepeat(1)}
                  className={`
                    px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all
                    ${ttsRepeat === 1
                      ? "bg-violet-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                    }
                  `}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => setTtsRepeat(3)}
                  className={`
                    px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all
                    ${ttsRepeat === 3
                      ? "bg-violet-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                    }
                  `}
                >
                  3x
                </button>
              </div>
            )}

            {/* Next Button */}
            {pos < total - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="
                  flex-1 inline-flex items-center justify-center gap-1
                  py-2.5 px-2 rounded-xl
                  bg-gradient-to-r from-violet-500 to-purple-600
                  text-white font-semibold text-sm
                  shadow-lg shadow-violet-500/25
                  hover:shadow-xl hover:shadow-violet-500/30
                  active:scale-[0.98]
                  transition-all
                  min-w-0
                "
              >
                <span className="truncate">Next</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** 레벨 선택 UI */
function LevelSelector({
  level,
  onLevelChange,
}: {
  level: JamoGameLevel;
  onLevelChange: (level: JamoGameLevel) => void;
}) {
  const levels: { value: JamoGameLevel; label: string; desc: string }[] = [
    { value: 1, label: "Lv.1", desc: "Jamo" },
    { value: 2, label: "Lv.2", desc: "Syllable" },
    { value: 3, label: "Lv.3", desc: "Final" },
  ];

  return (
    <div className="flex justify-center gap-2">
      {levels.map((lv) => (
        <button
          key={lv.value}
          type="button"
          onClick={() => onLevelChange(lv.value)}
          className={[
            "px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all",
            level === lv.value
              ? "bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/25"
              : "bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50",
          ].join(" ")}
        >
          <span className="block">{lv.label}</span>
          <span className="block text-xs font-normal opacity-75">{lv.desc}</span>
        </button>
      ))}
    </div>
  );
}
