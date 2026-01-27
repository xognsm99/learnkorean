"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface TtsEntry {
  id: string;   // "001"
  word: string;  // "다람쥐"
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface SpeechQuizModeProps {
  onSession: (correct: number, wrong: number) => void;
}

const QUIZ_COUNT = 15;

export default function SpeechQuizMode({ onSession }: SpeechQuizModeProps) {
  const [entries, setEntries] = useState<TtsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // quiz state
  const [order, setOrder] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [playing, setPlaying] = useState(false);

  // TTS repeat
  const [ttsRepeat, setTtsRepeat] = useState<1 | 3>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // fetch & parse TSV
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/audio/tts300/tts_map.tsv");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const lines = text.trim().split("\n");
        // skip header
        const parsed: TtsEntry[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split("\t");
          if (parts.length >= 2) {
            parsed.push({ id: parts[0].trim(), word: parts[1].trim() });
          }
        }
        if (parsed.length < 4) throw new Error("Not enough entries in TSV");
        setEntries(parsed);
        setOrder(shuffle(parsed.map((_, i) => i)).slice(0, QUIZ_COUNT));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load TSV");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = order.length;
  const currentIndex = order[pos];
  const current = entries[currentIndex];
  const done = pos >= total;

  // 4 choices: 1 correct + 3 wrong
  const choices = useMemo(() => {
    if (!current) return [];
    const wrongPool = entries.filter((_, i) => i !== currentIndex);
    const wrongs = shuffle(wrongPool).slice(0, 3);
    return shuffle([current, ...wrongs]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, currentIndex, entries, pos]);

  const playAudio = useCallback(
    (repeatCount: number = 1) => {
      if (!current) return;
      const url = `/audio/tts300/${current.id}.mp3`;

      // stop any previous
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      let played = 0;
      const playOnce = () => {
        const audio = new Audio(url);
        audioRef.current = audio;
        setPlaying(true);
        audio.play().catch(() => setPlaying(false));
        audio.onended = () => {
          played++;
          if (played < repeatCount) {
            setTimeout(playOnce, 500);
          } else {
            setPlaying(false);
          }
        };
        audio.onerror = () => setPlaying(false);
      };
      playOnce();
    },
    [current]
  );

  // auto-play when new question appears
  useEffect(() => {
    if (current && !done) {
      playAudio(1);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, current, done]);

  function handleSelect(choice: TtsEntry) {
    if (pickedIdx !== null) return;

    const idx = choices.indexOf(choice);
    setPickedIdx(idx);
    const isCorrect = choice.id === current.id;

    const newCorrect = isCorrect ? correct + 1 : correct;
    const newWrong = isCorrect ? wrong : wrong + 1;
    setCorrect(newCorrect);
    setWrong(newWrong);
    onSession(newCorrect, newWrong);
  }

  function next() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPickedIdx(null);
    setPos((v) => v + 1);
  }

  function restart() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setOrder(shuffle(entries.map((_, i) => i)).slice(0, QUIZ_COUNT));
    setPos(0);
    setPickedIdx(null);
    setCorrect(0);
    setWrong(0);
    onSession(0, 0);
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading speech data...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-rose-500 font-semibold mb-2">Failed to load data</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  // Complete
  if (done) {
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-6">
            {accuracy >= 80 ? "🎉" : accuracy >= 50 ? "👏" : "💪"}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete!</h2>
          <p className="text-slate-600 mb-6">
            {correct} correct / {wrong} incorrect
          </p>
          <div className="text-4xl font-bold text-slate-900 mb-2">{accuracy}%</div>
          <p className="text-sm text-slate-500 mb-8">Accuracy</p>

          <button
            type="button"
            onClick={restart}
            className="
              py-3 px-8 rounded-2xl
              bg-gradient-to-r from-indigo-500 to-purple-600
              text-white font-semibold
              shadow-lg shadow-indigo-500/25
              hover:shadow-xl hover:scale-[1.02]
              active:scale-[0.98]
              transition-all duration-300
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isAnswered = pickedIdx !== null;
  const isCorrectAnswer = isAnswered && choices[pickedIdx].id === current.id;
  const progress = total > 0 ? ((pos + 1) / total) * 100 : 0;

  return (
    <div className="space-y-6">
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
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Play area */}
      <div className="text-center py-8">
        <button
          type="button"
          onClick={() => playAudio(ttsRepeat)}
          disabled={playing}
          className={`
            w-28 h-28 mx-auto rounded-full
            flex items-center justify-center
            text-5xl
            shadow-2xl
            transition-all duration-300
            ${playing
              ? "bg-indigo-100 scale-110 shadow-indigo-300/50 animate-pulse"
              : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30 hover:scale-105 hover:shadow-indigo-500/40 active:scale-95"
            }
          `}
        >
          {playing ? (
            <span className="text-indigo-600">🔊</span>
          ) : (
            <span className="text-white">🔊</span>
          )}
        </button>

        <p className="mt-6 text-lg text-slate-600">
          Listen and choose the correct word
        </p>
      </div>

      {/* 4 Choices */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {choices.map((choice, idx) => {
          const isPicked = pickedIdx === idx;
          const isAnswer = choice.id === current.id;

          let btnClass =
            "w-full py-4 px-6 rounded-2xl border-2 text-lg font-semibold transition-all";

          if (isAnswered) {
            if (isAnswer) {
              btnClass += " bg-emerald-50 border-emerald-500 text-emerald-700";
            } else if (isPicked && !isAnswer) {
              btnClass += " bg-rose-50 border-rose-500 text-rose-700";
            } else {
              btnClass += " bg-slate-50 border-slate-200 text-slate-400";
            }
          } else {
            btnClass +=
              " bg-white border-slate-200 text-slate-900 hover:border-indigo-400 hover:bg-indigo-50";
          }

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => handleSelect(choice)}
              disabled={isAnswered}
              className={btnClass}
            >
              {choice.word}
            </button>
          );
        })}
      </div>

      {/* Result feedback */}
      {isAnswered && (
        <div
          className={`
            rounded-2xl p-4
            ${isCorrectAnswer ? "bg-emerald-50" : "bg-rose-50"}
          `}
        >
          <p className={`font-semibold ${isCorrectAnswer ? "text-emerald-700" : "text-rose-700"}`}>
            {isCorrectAnswer ? "Correct! 🎉" : `Wrong! Answer: ${current.word}`}
          </p>

          {/* Action buttons */}
          <div className="mt-4 flex items-stretch gap-2">
            {/* Listen button */}
            <button
              type="button"
              onClick={() => playAudio(ttsRepeat)}
              className={`
                flex-1 inline-flex items-center justify-center gap-1
                py-2.5 px-2 rounded-xl
                bg-white/80 backdrop-blur
                font-semibold text-sm
                active:scale-[0.98]
                transition-all
                min-w-0
                ${isCorrectAnswer
                  ? "border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  : "border-2 border-rose-300 text-rose-700 hover:bg-rose-100"
                }
              `}
            >
              <span>🔊</span>
              <span className="truncate">Listen &quot;{current.word}&quot;</span>
            </button>

            {/* Repeat Toggle */}
            <div className="flex items-center bg-white/60 backdrop-blur rounded-xl p-1 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setTtsRepeat(1)}
                className={`
                  px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all
                  ${ttsRepeat === 1
                    ? "bg-indigo-500 text-white shadow-md"
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
                    ? "bg-indigo-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                3x
              </button>
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={next}
              className="
                flex-1 inline-flex items-center justify-center gap-1
                py-2.5 px-2 rounded-xl
                bg-gradient-to-r from-indigo-500 to-purple-600
                text-white font-semibold text-sm
                shadow-lg shadow-indigo-500/25
                hover:shadow-xl hover:shadow-indigo-500/30
                active:scale-[0.98]
                transition-all
                min-w-0
              "
            >
              <span className="truncate">Next</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
