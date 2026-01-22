"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import type { ImageQuizItem, ImageQuizCategory } from "@/app/lib/data";
import {
  fetchImageQuizByCategory,
  shuffle,
  IMAGE_QUIZ_CATEGORIES,
} from "@/app/lib/imageQuiz";

interface ImageQuizModeProps {
  onSession: (correct: number, wrong: number) => void;
}

type Screen = "category" | "quiz";

const QUIZ_COUNT = 10;

export default function ImageQuizMode({ onSession }: ImageQuizModeProps) {
  const [screen, setScreen] = useState<Screen>("category");
  const [selectedCategory, setSelectedCategory] = useState<ImageQuizCategory | null>(null);
  const [quizzes, setQuizzes] = useState<ImageQuizItem[]>([]);
  const [pos, setPos] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCategorySelect = async (category: ImageQuizCategory) => {
    setSelectedCategory(category);
    setLoading(true);

    const data = await fetchImageQuizByCategory(category);
    const shuffled = shuffle(data).slice(0, QUIZ_COUNT);
    setQuizzes(shuffled);

    setPos(0);
    setCorrect(0);
    setWrong(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
    setLoading(false);
    setScreen("quiz");
  };

  const handleBackToCategories = () => {
    setScreen("category");
    setSelectedCategory(null);
    setQuizzes([]);
  };

  const currentQuiz = quizzes[pos];
  const total = quizzes.length;

  const options = useMemo(() => {
    if (!currentQuiz) return [];
    return [
      { label: "A", text: currentQuiz.option1 },
      { label: "B", text: currentQuiz.option2 },
      { label: "C", text: currentQuiz.option3 },
      { label: "D", text: currentQuiz.option4 },
    ];
  }, [currentQuiz]);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    const isAnswerCorrect = answerIndex === currentQuiz.answer_index;

    setSelectedAnswer(answerIndex);
    setIsCorrect(isAnswerCorrect);

    const newCorrect = isAnswerCorrect ? correct + 1 : correct;
    const newWrong = isAnswerCorrect ? wrong : wrong + 1;

    if (isAnswerCorrect) {
      setCorrect(newCorrect);
    } else {
      setWrong(newWrong);
    }

    onSession(newCorrect, newWrong);
  };

  const handleNext = () => {
    if (pos < total - 1) {
      setPos((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const handleRestart = () => {
    if (selectedCategory) {
      handleCategorySelect(selectedCategory);
    }
  };

  const isComplete = pos === total - 1 && selectedAnswer !== null;

  const categoryInfo = IMAGE_QUIZ_CATEGORIES.find(
    (c) => c.id === selectedCategory
  );

  // Category Selection Screen
  if (screen === "category") {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Choose a Category
          </h2>
          <p className="text-slate-500">
            Select a topic to start the image quiz
          </p>
        </div>

        <div className="space-y-3">
          {IMAGE_QUIZ_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
              className={`
                group w-full text-left
                rounded-2xl p-4
                bg-gradient-to-br ${category.gradient}
                backdrop-blur-xl
                border border-white/60
                shadow-lg shadow-slate-900/5
                hover:shadow-2xl hover:shadow-slate-900/10
                hover:scale-[1.02] hover:border-white/80
                active:scale-[0.98]
                transition-all duration-300 ease-out
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center
                    rounded-xl ${category.iconBg}
                    text-2xl
                    shadow-lg
                    group-hover:scale-110 group-hover:rotate-3
                    transition-transform duration-300
                  `}
                >
                  {category.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-slate-900 group-hover:text-slate-800">
                    {category.title}
                  </div>
                  <div className="text-sm text-slate-500">
                    {category.titleKo}
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  // No data
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">No quiz data available for this category.</p>
        <button
          type="button"
          onClick={handleBackToCategories}
          className="text-cyan-600 font-medium hover:text-cyan-700"
        >
          Back to categories
        </button>
      </div>
    );
  }

  // Complete screen
  if (isComplete) {
    const accuracy = Math.round((correct / total) * 100);
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-6">
            {accuracy >= 80 ? "🎉" : accuracy >= 50 ? "👏" : "💪"}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Quiz Complete!
          </h2>
          <p className="text-slate-600 mb-6">
            {correct} correct / {wrong} incorrect
          </p>
          <div className="text-4xl font-bold text-slate-900 mb-2">
            {accuracy}%
          </div>
          <p className="text-sm text-slate-500 mb-6">Accuracy</p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="
                py-3 px-6 rounded-2xl
                bg-white border-2 border-slate-200
                text-slate-700 font-semibold
                hover:bg-slate-50 hover:border-slate-300
                active:scale-95
                transition-all
              "
              onClick={handleBackToCategories}
            >
              Other Category
            </button>
            <button
              type="button"
              className="
                py-3 px-6 rounded-2xl
                bg-gradient-to-r from-cyan-500 to-teal-600
                text-white font-semibold
                shadow-lg shadow-cyan-500/25
                hover:shadow-xl hover:shadow-cyan-500/30
                active:scale-95
                transition-all
              "
              onClick={handleRestart}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Category Badge & Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBackToCategories}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Categories
        </button>
        {categoryInfo && (
          <span className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
            ${categoryInfo.iconBg} text-white
          `}>
            {categoryInfo.emoji} {categoryInfo.title}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i < pos
                    ? "bg-gradient-to-r from-cyan-500 to-teal-500"
                    : i === pos
                    ? "bg-gradient-to-r from-cyan-400 to-teal-400"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">{pos + 1} / {total}</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {wrong}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {correct}
            </span>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-lg">
        <Image
          src={currentQuiz.image_url}
          alt="Quiz image"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Question */}
      <div className="pt-2 pb-1">
        <div className="flex items-start gap-3">
          <span className="text-lg font-bold text-slate-400">{pos + 1}.</span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 leading-relaxed">
              {currentQuiz.question}
            </h2>
            {currentQuiz.question_en && (
              <p className="mt-1.5 text-sm text-slate-500 italic leading-relaxed">
                {currentQuiz.question_en}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {options.map((option, idx) => {
          const optionIndex = idx + 1;
          const isSelected = selectedAnswer === optionIndex;
          const isCorrectOption = optionIndex === currentQuiz.answer_index;
          const showResult = selectedAnswer !== null;

          let optionClass = `
            w-full text-left p-3.5 rounded-xl
            border-2 transition-all duration-300
            flex items-start gap-3
          `;

          if (showResult) {
            if (isCorrectOption) {
              optionClass += " bg-emerald-50/80 border-emerald-500 shadow-lg shadow-emerald-500/10";
            } else if (isSelected && !isCorrect) {
              optionClass += " bg-rose-50/80 border-rose-500 shadow-lg shadow-rose-500/10";
            } else {
              optionClass += " bg-slate-50/50 border-slate-200/50 opacity-60";
            }
          } else {
            optionClass += `
              bg-white/60 backdrop-blur-sm border-slate-200/60
              hover:border-cyan-300 hover:bg-cyan-50/50 hover:shadow-lg hover:shadow-cyan-500/5
              active:scale-[0.98]
            `;
          }

          return (
            <button
              key={optionIndex}
              type="button"
              className={optionClass}
              onClick={() => handleAnswer(optionIndex)}
              disabled={selectedAnswer !== null}
            >
              <span
                className={`
                  flex-shrink-0 w-7 h-7 rounded-lg
                  flex items-center justify-center
                  text-sm font-bold
                  transition-all duration-300
                  ${
                    showResult && isCorrectOption
                      ? "bg-emerald-500 text-white"
                      : showResult && isSelected && !isCorrect
                      ? "bg-rose-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }
                `}
              >
                {option.label}
              </span>
              <div className="flex-1 pt-0.5">
                <span
                  className={`
                    font-medium text-sm
                    ${
                      showResult && isCorrectOption
                        ? "text-emerald-700"
                        : showResult && isSelected && !isCorrect
                        ? "text-rose-700"
                        : "text-slate-700"
                    }
                  `}
                >
                  {option.text}
                </span>

                {showResult && (isCorrectOption || (isSelected && !isCorrect)) && (
                  <div className="mt-1.5 text-sm">
                    {isCorrectOption ? (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-emerald-600">
                          {isSelected ? "Correct!" : "Answer"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-rose-600">Wrong</span>
                      </div>
                    )}
                    <p className="mt-1 text-slate-600 pl-6">
                      {currentQuiz.rationale}
                    </p>
                    {currentQuiz.rationale_en && (
                      <p className="mt-0.5 text-slate-500 pl-6 text-xs italic">
                        {currentQuiz.rationale_en}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint Toggle */}
      {currentQuiz.hint && (
        <div>
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="
              flex items-center gap-2
              text-sm font-medium text-slate-500
              hover:text-slate-700 transition-colors
            "
          >
            <span>Hint</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${showHint ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showHint && (
            <div
              className="
                mt-3 p-4 rounded-xl
                bg-gradient-to-br from-slate-50 to-slate-100/50
                border border-slate-200/60
                backdrop-blur-sm
              "
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600 pt-1.5">{currentQuiz.hint}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      {selectedAnswer !== null && pos < total - 1 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleNext}
            className="
              px-5 py-2.5 rounded-xl
              bg-gradient-to-r from-cyan-500 to-teal-500
              text-white text-sm font-semibold
              shadow-lg shadow-cyan-500/25
              hover:shadow-xl hover:shadow-cyan-500/30
              active:scale-95
              transition-all
            "
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
