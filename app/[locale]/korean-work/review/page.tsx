"use client";

import { useState, useEffect } from "react";
import { getSessionResult, SessionResult } from "@/app/lib/data";

export default function Page() {
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const result = getSessionResult();
    setSessionResult(result);
    setIsLoading(false);
  }, []);

  const getModeLabel = (mode: SessionResult["lastMode"]): string => {
    switch (mode) {
      case "jamo":
        return "Jamo Quiz";
      case "emoji":
        return "Emoji Vocab";
      case "interview":
        return "Interview Prep";
      default:
        return "Unknown";
    }
  };

  const getModeIcon = (mode: SessionResult["lastMode"]): string => {
    switch (mode) {
      case "jamo":
        return "ㅎ";
      case "emoji":
        return "🎯";
      case "interview":
        return "💼";
      default:
        return "📚";
    }
  };

  const getModeGradient = (mode: SessionResult["lastMode"]): string => {
    switch (mode) {
      case "jamo":
        return "from-violet-500 to-purple-600";
      case "emoji":
        return "from-amber-500 to-orange-500";
      case "interview":
        return "from-sky-500 to-blue-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAccuracyPercentage = (correct: number, wrong: number): number => {
    const total = correct + wrong;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Your Progress
          </h1>
          <p className="text-lg text-slate-500">
            Track your Korean learning journey
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className="
              rounded-3xl p-8
              bg-white/70 backdrop-blur-2xl
              border border-white/50
              shadow-2xl shadow-slate-900/10
              text-center
            "
          >
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded-full w-32 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded-full w-48 mx-auto"></div>
            </div>
          </div>
        ) : sessionResult ? (
          <div className="space-y-6">
            {/* Stats Card */}
            <div
              className="
                rounded-3xl p-6
                bg-white/70 backdrop-blur-2xl
                border border-white/50
                shadow-2xl shadow-slate-900/10
              "
            >
              {/* Mode Badge */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`
                    flex h-16 w-16 items-center justify-center
                    rounded-2xl bg-gradient-to-br ${getModeGradient(sessionResult.lastMode)}
                    text-2xl text-white font-bold
                    shadow-lg
                  `}
                >
                  {getModeIcon(sessionResult.lastMode)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {getModeLabel(sessionResult.lastMode)}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {formatDate(sessionResult.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div
                  className="
                    rounded-2xl p-4 text-center
                    bg-gradient-to-br from-emerald-500/10 to-green-500/10
                    border border-emerald-500/20
                  "
                >
                  <div className="text-3xl font-bold text-emerald-600">
                    {sessionResult.correct}
                  </div>
                  <p className="text-sm text-emerald-600/80 mt-1">Correct</p>
                </div>
                <div
                  className="
                    rounded-2xl p-4 text-center
                    bg-gradient-to-br from-rose-500/10 to-red-500/10
                    border border-rose-500/20
                  "
                >
                  <div className="text-3xl font-bold text-rose-600">
                    {sessionResult.wrong}
                  </div>
                  <p className="text-sm text-rose-600/80 mt-1">Incorrect</p>
                </div>
                <div
                  className="
                    rounded-2xl p-4 text-center
                    bg-gradient-to-br from-violet-500/10 to-purple-500/10
                    border border-violet-500/20
                  "
                >
                  <div className="text-3xl font-bold text-violet-600">
                    {getAccuracyPercentage(sessionResult.correct, sessionResult.wrong)}%
                  </div>
                  <p className="text-sm text-violet-600/80 mt-1">Accuracy</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Session Progress</span>
                  <span className="font-semibold text-slate-700">
                    {sessionResult.correct + sessionResult.wrong} completed
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getModeGradient(sessionResult.lastMode)} transition-all duration-500`}
                    style={{
                      width: `${getAccuracyPercentage(sessionResult.correct, sessionResult.wrong)}%`,
                    }}
                  />
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="./learn"
                className="
                  block w-full py-4 px-6
                  rounded-2xl text-center
                  bg-gradient-to-r from-slate-900 to-slate-800
                  text-white font-semibold
                  shadow-lg shadow-slate-900/25
                  hover:shadow-xl hover:shadow-slate-900/30
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-300
                "
              >
                Continue Learning
              </a>
            </div>

            {/* Tips Card */}
            <div
              className="
                rounded-3xl p-6
                bg-white/70 backdrop-blur-2xl
                border border-white/50
                shadow-lg shadow-slate-900/5
              "
            >
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Study Tips
              </h2>
              <div className="space-y-3">
                <TipItem
                  title="Spaced Repetition"
                  desc="Review at increasing intervals for better retention"
                />
                <TipItem
                  title="Active Recall"
                  desc="Test yourself before checking the answer"
                />
                <TipItem
                  title="Focus on Weaknesses"
                  desc="Spend more time on challenging topics"
                />
                <TipItem
                  title="Daily Practice"
                  desc="Consistency beats intensity for language learning"
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="
              rounded-3xl p-10
              bg-white/70 backdrop-blur-2xl
              border border-white/50
              shadow-2xl shadow-slate-900/10
              text-center
            "
          >
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Start Your Journey
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Begin learning Korean today and track your progress here
            </p>
            <a
              href="./learn"
              className="
                inline-block py-4 px-8
                rounded-2xl
                bg-gradient-to-r from-slate-900 to-slate-800
                text-white font-semibold
                shadow-lg shadow-slate-900/25
                hover:shadow-xl hover:shadow-slate-900/30
                hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-300
              "
            >
              Start Learning
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function TipItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
      <div>
        <span className="font-medium text-slate-900">{title}</span>
        <span className="text-slate-500"> — {desc}</span>
      </div>
    </div>
  );
}
