"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["다람쥐", "물방울", "북극곰", "붕어", "부엉이"];

const CHIP_COLORS = [
  "from-violet-400/20 to-purple-400/20 border-violet-300/40",
  "from-sky-400/20 to-blue-400/20 border-sky-300/40",
  "from-amber-400/20 to-orange-400/20 border-amber-300/40",
  "from-rose-400/20 to-pink-400/20 border-rose-300/40",
  "from-emerald-400/20 to-teal-400/20 border-emerald-300/40",
];

const ACTIVE_GLOW = [
  "shadow-violet-400/30",
  "shadow-sky-400/30",
  "shadow-amber-400/30",
  "shadow-rose-400/30",
  "shadow-emerald-400/30",
];

export default function PrettyKoreanWordsHero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % WORDS.length), 2100);
    return () => clearInterval(t);
  }, []);

  const active = WORDS[idx];
  const chips = useMemo(() => WORDS.map((w, i) => ({ w, i })), []);

  return (
    <div className="mt-6 mb-2">
      <div
        className="
          relative overflow-hidden
          rounded-2xl p-5 sm:p-6
          bg-white/50 backdrop-blur-2xl
          border border-white/60
          shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]
        "
      >
        {/* Label */}
        <div className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3 text-center">
          Pretty Korean · 예쁜 한글
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Title */}
          <div className="text-base sm:text-lg font-semibold text-slate-700 leading-snug text-center">
            Words foreigners love
            <span className="text-slate-400 font-medium"> · 외국인이 좋아하는 단어</span>
          </div>

          {/* Rotating word */}
          <div className="relative h-[44px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-slate-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent"
                style={{
                  textShadow: "0 8px 24px rgba(99,102,241,0.15)",
                }}
              >
                {active}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="text-xs text-slate-400 text-center">
            Tap and listen in Speech Quiz · 스피치 퀴즈에서 발음도 들어보세요
          </div>

          {/* Floating chips */}
          <div className="flex gap-2 flex-wrap justify-center">
            {chips.map(({ w, i }) => (
              <motion.span
                key={w}
                animate={{
                  y: [0, -5, 0],
                  scale: idx === i ? 1.1 : 1.0,
                }}
                transition={{
                  y: {
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.15,
                  },
                  scale: { duration: 0.3 },
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-semibold
                  border backdrop-blur-sm
                  transition-shadow duration-300
                  bg-gradient-to-br ${CHIP_COLORS[i]}
                  ${idx === i
                    ? `shadow-lg ${ACTIVE_GLOW[i]} text-slate-900`
                    : "shadow-sm text-slate-600"
                  }
                `}
              >
                {w}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
