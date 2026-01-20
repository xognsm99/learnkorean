"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  emojiVocabData,
  jamoQuizData,
  workInterviewData,
} from "@/app/lib/data";
import JamoMode from "@/app/components/learn/modes/JamoMode";
import EmojiVocabMode from "@/app/components/learn/modes/EmojiVocabMode";
import InterviewMode from "@/app/components/learn/modes/InterviewMode";

export type LearnMode = "jamo" | "emoji" | "interview";

export type LastSession = {
  lastMode: LearnMode;
  correct: number;
  wrong: number;
  updatedAt: string;
};

const LS_KEY = "kw_last_session";

function saveSession(payload: LastSession) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

type Screen = "menu" | "play";

export default function LearnHub() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<LearnMode>("jamo");

  const headerTitle = useMemo(() => {
    if (mode === "jamo") return "Jamo Quiz";
    if (mode === "emoji") return "Emoji Vocab";
    return "Interview Cards";
  }, [mode]);

  const headerDesc = useMemo(() => {
    if (mode === "jamo") return "Learn Korean consonants & vowels";
    if (mode === "emoji") return "Build vocabulary with emojis";
    return "Practice job interview questions";
  }, [mode]);

  // MENU Screen
  if (screen === "menu") {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="mx-auto w-full max-w-2xl">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">
              Learn Korean
            </h1>
            <p className="text-lg text-slate-500">
              Master the language through interactive lessons
            </p>
          </div>

          {/* Mode Cards */}
          <div className="space-y-4">
            <ModeCard
              title="Jamo Quiz"
              desc="Master Hangul consonants & vowels"
              icon="ㅎ"
              gradient="from-violet-500/20 to-purple-500/20"
              iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
              onClick={() => {
                setMode("jamo");
                setScreen("play");
              }}
            />

            <ModeCard
              title="Emoji Vocab"
              desc="Learn words with visual memory"
              icon="🎯"
              gradient="from-amber-500/20 to-orange-500/20"
              iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
              onClick={() => {
                setMode("emoji");
                setScreen("play");
              }}
            />

            <ModeCard
              title="Interview Prep"
              desc="Ace your Korean job interview"
              icon="💼"
              gradient="from-sky-500/20 to-blue-500/20"
              iconBg="bg-gradient-to-br from-sky-500 to-blue-600"
              onClick={() => {
                setMode("interview");
                setScreen("play");
              }}
            />

            {/* Scene Practice - Link to separate page */}
            <Link href={`/${locale}/korean-work/learn/scene`} className="block">
              <div
                className={`
                  group w-full text-left
                  rounded-3xl p-5
                  bg-gradient-to-br from-emerald-500/20 to-teal-500/20
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
                      flex h-14 w-14 items-center justify-center
                      rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600
                      text-2xl text-white font-bold
                      shadow-lg
                      group-hover:scale-110 group-hover:rotate-3
                      transition-transform duration-300
                    `}
                  >
                    🎬
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-slate-900 group-hover:text-slate-800">
                      Scene Practice
                    </div>
                    <div className="mt-0.5 text-sm text-slate-600">
                      Practice Korean in real situations
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-center text-sm text-slate-400 mt-8">
            Your progress is automatically saved
          </p>
        </div>
      </div>
    );
  }

  // PLAY Screen
  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {headerTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{headerDesc}</p>
          </div>

          <button
            type="button"
            onClick={() => setScreen("menu")}
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
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Content Card */}
        <div
          className="
            rounded-3xl p-6
            bg-white/70 backdrop-blur-2xl
            border border-white/50
            shadow-2xl shadow-slate-900/10
          "
        >
          {mode === "jamo" && (
            <JamoMode
              data={jamoQuizData}
              onSession={(correct, wrong) =>
                saveSession({
                  lastMode: "jamo",
                  correct,
                  wrong,
                  updatedAt: new Date().toISOString(),
                })
              }
            />
          )}

          {mode === "emoji" && (
            <EmojiVocabMode
              items={emojiVocabData}
              onSession={(correct, wrong) =>
                saveSession({
                  lastMode: "emoji",
                  correct,
                  wrong,
                  updatedAt: new Date().toISOString(),
                })
              }
            />
          )}

          {mode === "interview" && (
            <InterviewMode
              cards={workInterviewData}
              onSession={(correct, wrong) =>
                saveSession({
                  lastMode: "interview",
                  correct,
                  wrong,
                  updatedAt: new Date().toISOString(),
                })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  title,
  desc,
  icon,
  gradient,
  iconBg,
  onClick,
}: {
  title: string;
  desc: string;
  icon: string;
  gradient: string;
  iconBg: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group w-full text-left
        rounded-3xl p-5
        bg-gradient-to-br ${gradient}
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
            flex h-14 w-14 items-center justify-center
            rounded-2xl ${iconBg}
            text-2xl text-white font-bold
            shadow-lg
            group-hover:scale-110 group-hover:rotate-3
            transition-transform duration-300
          `}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-slate-900 group-hover:text-slate-800">
            {title}
          </div>
          <div className="mt-0.5 text-sm text-slate-600">
            {desc}
          </div>
        </div>
        <svg
          className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
