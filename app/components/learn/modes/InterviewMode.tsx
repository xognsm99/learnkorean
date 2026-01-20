"use client";

import { useState } from "react";
import type { InterviewCardItem } from "@/app/lib/data";

interface InterviewModeProps {
  cards: InterviewCardItem[];
  onSession: (correct: number, wrong: number) => void;
}

export default function InterviewMode({ cards, onSession }: InterviewModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const currentItem = cards[currentIndex];
  const total = cards.length;
  const progress = ((currentIndex + 1) / total) * 100;
  const isComplete = currentIndex >= total;

  const handleNext = () => {
    const newReviewed = reviewed + 1;
    setReviewed(newReviewed);
    onSession(newReviewed, 0);
    setShowSample(false);

    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(total); // trigger complete
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setShowSample(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete!</h2>
        <p className="text-slate-600 mb-6">
          You reviewed {reviewed} questions
        </p>
        <div className="text-4xl font-bold text-slate-900 mb-2">100%</div>
        <p className="text-sm text-slate-500">Completion Rate</p>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">
            {currentIndex + 1} / {total}
          </span>
          <span className="text-slate-500">Reviewed: {reviewed}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Interview Card */}
      <div className="py-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {currentItem.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium border border-sky-200"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-slate-900 leading-relaxed mb-6">
          {currentItem.prompt}
        </h3>

        {/* Sample Answer Toggle */}
        <button
          type="button"
          className="w-full py-4 px-6 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-semibold hover:border-sky-400 hover:bg-sky-50 transition-all mb-4"
          onClick={() => setShowSample(!showSample)}
        >
          {showSample ? "Hide Sample Answer" : "Show Sample Answer"}
        </button>

        {showSample && currentItem.extra?.sampleAnswerKo && (
          <div className="rounded-2xl bg-sky-50 border border-sky-100 p-5 mb-4">
            <h4 className="text-sm font-semibold text-sky-700 mb-3">
              Sample Answer
            </h4>
            <p className="text-slate-700 leading-relaxed mb-4">
              {currentItem.extra.sampleAnswerKo}
            </p>

            {currentItem.extra.keyPhrases && (
              <div>
                <h5 className="text-xs font-medium text-slate-500 mb-2">
                  Key Phrases
                </h5>
                <div className="flex flex-wrap gap-2">
                  {currentItem.extra.keyPhrases.map((phrase, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-full bg-white text-slate-600 text-xs border border-slate-200"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="py-4 px-6 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            Previous
          </button>
          <button
            type="button"
            className="py-4 px-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-all"
            onClick={handleNext}
          >
            {currentIndex === total - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
