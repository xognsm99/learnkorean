"use client";

import { useMemo, useState } from "react";
import type { EmojiVocabItem } from "@/app/lib/data";

// Extended type for anthem items
interface AnthemEmojiItem extends EmojiVocabItem {
  verse?: number;
  lyric?: string;
}
import twemoji from "twemoji";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWrongChoices(
  items: EmojiVocabItem[],
  correctItem: EmojiVocabItem,
  count: number
): EmojiVocabItem[] {
  const pool = items.filter((x) => x.id !== correctItem.id);
  return shuffle(pool).slice(0, count);
}

interface EmojiVocabModeProps {
  items: EmojiVocabItem[];
  onSession: (correct: number, wrong: number) => void;
}

type Level = 1 | 2 | 3;
const UNLOCK_KEY = "kw_emoji_unlocked_level";

function readUnlockedLevel(): Level {
  try {
    const raw = localStorage.getItem(UNLOCK_KEY);
    const n = Number(raw);
    if (n === 2 || n === 3) return n;
    return 1;
  } catch {
    return 1;
  }
}

function writeUnlockedLevel(lv: Level) {
  try {
    localStorage.setItem(UNLOCK_KEY, String(lv));
  } catch {
    // ignore
  }
}

export default function EmojiVocabMode({ items, onSession }: EmojiVocabModeProps) {
  // ✅ 레벨/언락 상태 (디자인 영향 최소)
  const [level, setLevel] = useState<Level>(1);
  const [unlocked, setUnlocked] = useState<Level>(() => {
    if (typeof window === "undefined") return 1;
    return readUnlockedLevel();
  });

  // ✅ 선택 레벨만 출제
  const levelItems = useMemo(() => {
    return items.filter((x) => (x.level ?? 1) === level);
  }, [items, level]);

  // ✅ Level 3 애국가: 1절→후렴→2절→후렴→3절→후렴→4절→후렴 순서로 정렬
  const anthemOrderedItems = useMemo(() => {
    if (level !== 3) return levelItems;

    const anthemItems = levelItems as AnthemEmojiItem[];
    const verse1 = anthemItems.filter(x => x.verse === 1);
    const verse2 = anthemItems.filter(x => x.verse === 2);
    const verse3 = anthemItems.filter(x => x.verse === 3);
    const verse4 = anthemItems.filter(x => x.verse === 4);
    const chorus = anthemItems.filter(x => x.verse === 0); // 후렴

    // 1절 → 후렴 → 2절 → 후렴 → 3절 → 후렴 → 4절 → 후렴
    return [
      ...verse1,
      ...chorus,
      ...verse2,
      ...chorus,
      ...verse3,
      ...chorus,
      ...verse4,
      ...chorus,
    ];
  }, [levelItems, level]);

  const total = anthemOrderedItems.length;

  // Randomize question order (레벨별) - Level 3는 순서 고정
  const order = useMemo(() => {
    if (level === 3) {
      // Level 3: 순서 고정 (랜덤 X)
      return anthemOrderedItems.map((_, i) => i);
    }
    return shuffle(levelItems.map((_, i) => i));
  }, [levelItems, anthemOrderedItems, level]);

  const [pos, setPos] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const currentIndex = order[pos];
  // Level 3는 anthemOrderedItems, 그 외는 levelItems
  const currentItems = level === 3 ? anthemOrderedItems : levelItems;
  const current = currentItems[currentIndex];
  const done = pos >= total;

  // Generate 4 choices (레벨 풀 안에서 뽑음)
  const choices = useMemo(() => {
    if (!current) return [];
    const wrongs = pickWrongChoices(levelItems, current, 3);
    return shuffle([current, ...wrongs]);
  }, [current, levelItems, pos]);

  const progress = total > 0 ? ((pos + 1) / total) * 100 : 0;

  function handleSelect(choice: EmojiVocabItem) {
    if (pickedId !== null) return;

    setPickedId(choice.id);
    const isCorrect = choice.id === current.id;

    const newCorrect = isCorrect ? correct + 1 : correct;
    const newWrong = isCorrect ? wrong : wrong + 1;

    setCorrect(newCorrect);
    setWrong(newWrong);
    onSession(newCorrect, newWrong);
  }

  function next() {
    setPickedId(null);
    setPos((v) => v + 1);
  }

  function restart() {
    setPos(0);
    setPickedId(null);
    setCorrect(0);
    setWrong(0);
    onSession(0, 0);
  }

  // ✅ 레벨 바꾸기 (잠금이면 무시) + 진행 초기화
  function changeLevel(nextLv: Level) {
    if (nextLv > unlocked) return;
    setLevel(nextLv);
    restart();
  }

  // ✅ 완료 시 다음 레벨 언락 (디자인 건드리지 않고 로직만)
  function unlockNextIfNeeded() {
    if (level === 1 && unlocked < 2) {
      setUnlocked(2);
      writeUnlockedLevel(2);
    } else if (level === 2 && unlocked < 3) {
      setUnlocked(3);
      writeUnlockedLevel(3);
    }
  }

  // ✅ 국기(Lv2)만 twemoji로 이미지 렌더
  // - Windows에서 국기 이모지가 "HR" 같은 글자로 fallback 되는 문제 해결
  function renderTwemoji(emoji: string) {
    // svg로 뽑아야 선명함, className으로 크기 지정
    const html = twemoji.parse(emoji, {
      folder: "svg",
      ext: ".svg",
      className: "twemoji-flag"
    });
    return (
      <span
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  const isFlagLevel = level === 2 && current?.category === "국기";
  const isAnthemLevel = level === 3;
  const currentAnthem = current as AnthemEmojiItem;
  // 태극기 이모지가 포함된 경우 twemoji 사용
  const hasKoreanFlag = current?.emoji?.includes("🇰🇷");

  // Empty state
  if (!items?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No vocabulary data available.</p>
      </div>
    );
  }

  // ✅ 레벨 데이터가 비어있을 때(예: Lv2/Lv3 아직 없음)
  if (!levelItems.length) {
    return (
      <div className="space-y-6">
        <LevelBar level={level} unlocked={unlocked} onChange={changeLevel} />
        <div className="text-center py-8">
          <p className="text-slate-500">No data for Level {level} yet.</p>
          <p className="text-sm text-slate-400 mt-2">
            JSON에 level:{level} 데이터가 추가되면 자동으로 출제됩니다.
          </p>
        </div>
      </div>
    );
  }

  // Complete state
  if (done) {
    unlockNextIfNeeded();

    const accuracy = Math.round((correct / total) * 100);
    const nextLevel = level === 1 ? 2 : level === 2 ? 3 : 3;
    const canGoNext = level < 3 && unlocked >= nextLevel;

    return (
      <div className="space-y-6">
        {/* ✅ 레벨 바 (디자인 최소 추가) */}
        <LevelBar level={level} unlocked={unlocked} onChange={changeLevel} />

        <div className="text-center py-8">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete!</h2>
          <p className="text-slate-600 mb-6">
            {correct} correct / {wrong} incorrect
          </p>
          <div className="text-4xl font-bold text-slate-900 mb-2">{accuracy}%</div>
          <p className="text-sm text-slate-500 mb-8">Accuracy</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={restart}
              className="
                py-3 px-8 rounded-2xl
                bg-gradient-to-r from-amber-500 to-orange-500
                text-white font-semibold
                shadow-lg shadow-amber-500/25
                hover:shadow-xl hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-300
              "
            >
              Try Again
            </button>

            {/* ✅ 다음 레벨 버튼(원치 않으면 이 버튼만 지워도 됨) */}
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => changeLevel(nextLevel as Level)}
              className={[
                "py-3 px-8 rounded-2xl font-semibold transition-all duration-300",
                canGoNext
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed",
              ].join(" ")}
            >
              Next Level (Lv.{nextLevel})
            </button>
          </div>
        </div>

      </div>
    );
  }

  const isAnswered = pickedId !== null;
  const isCorrectAnswer = pickedId === current.id;

  return (
    <div className="space-y-6">
      {/* ✅ 레벨 바 (UI 최소 추가) */}
      <LevelBar level={level} unlocked={unlocked} onChange={changeLevel} />

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
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quiz Card */}
      <div className="text-center py-6">
        {/* Category badge */}
        <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-4 border border-amber-200">
          {isAnthemLevel
            ? `애국가 ${currentAnthem.verse === 0 ? "후렴" : currentAnthem.verse + "절"}`
            : `${current.category} · Lv.${level}`}
        </span>

        {/* ✅ Display (Lv2 국기만 twemoji, Lv3 애국가, 나머지는 기존) */}
        {isFlagLevel ? (
          <div className="kw-flag mb-4 flex justify-center">
            <div className="flex items-center justify-center" style={{ width: 120, height: 120 }}>
              {renderTwemoji(current.emoji)}
            </div>
          </div>
        ) : isAnthemLevel ? (
          <div className="mb-4">
            {/* 태극기 포함 이모지는 twemoji로 렌더링 */}
            {hasKoreanFlag ? (
              <div className="kw-anthem-emoji mb-4 flex justify-center">
                <div className="flex items-center justify-center" style={{ minHeight: 80 }}>
                  {renderTwemoji(current.emoji)}
                </div>
              </div>
            ) : (
              <div
                className="text-[80px] leading-none mb-4"
                style={{
                  fontFamily:
                    '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif',
                }}
              >
                {current.emoji}
              </div>
            )}
            {/* 가사 힌트 표시 */}
            {currentAnthem.lyric && (
              <div className="bg-slate-100 rounded-xl px-4 py-3 mx-auto max-w-sm">
                <p className="text-sm text-slate-500 mb-1">Lyric hint:</p>
                <p className="text-slate-700 font-medium">{currentAnthem.lyric}</p>
              </div>
            )}
          </div>
        ) : (
          <div
            className="text-[100px] leading-none mb-4"
            style={{
              fontFamily:
                '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif',
            }}
          >
            {current.emoji}
          </div>
        )}

        {/* Question */}
        <p className="text-lg text-slate-600 mb-8">
          {isAnthemLevel ? "What does this emoji represent?" : "What is this in Korean?"}
        </p>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {choices.map((choice) => {
            const isPicked = pickedId === choice.id;
            const isAnswer = choice.id === current.id;

            let buttonClass =
              "w-full py-4 px-6 rounded-2xl border-2 text-lg font-semibold transition-all";

            if (isAnswered) {
              if (isAnswer) {
                buttonClass += " bg-emerald-50 border-emerald-500 text-emerald-700";
              } else if (isPicked && !isAnswer) {
                buttonClass += " bg-rose-50 border-rose-500 text-rose-700";
              } else {
                buttonClass += " bg-slate-50 border-slate-200 text-slate-400";
              }
            } else {
              buttonClass +=
                " bg-white border-slate-200 text-slate-900 hover:border-amber-400 hover:bg-amber-50";
            }

            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleSelect(choice)}
                disabled={isAnswered}
                className={buttonClass}
              >
                {choice.ko}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result feedback */}
      {isAnswered && (
        <div
          className={`
            rounded-2xl p-4
            ${isCorrectAnswer ? "bg-emerald-50" : "bg-rose-50"}
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${isCorrectAnswer ? "text-emerald-700" : "text-rose-700"}`}>
                {isCorrectAnswer ? "Correct! 🎉" : `Wrong! Answer: ${current.ko}`}
              </p>
              <p className="text-sm text-slate-500 mt-1">English: {current.en}</p>
            </div>
            <button
              type="button"
              onClick={next}
              className="
                py-2.5 px-6 rounded-xl
                bg-slate-900 text-white font-semibold
                hover:bg-slate-800
                transition-all duration-200
              "
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/** ✅ 디자인 최소로 넣은 레벨 바 */
function LevelBar({
  level,
  unlocked,
  onChange,
}: {
  level: 1 | 2 | 3;
  unlocked: 1 | 2 | 3;
  onChange: (lv: 1 | 2 | 3) => void;
}) {
  const btnBase = "px-3 py-1.5 rounded-full text-sm font-semibold border transition-all";

  return (
    <div className="flex gap-2 justify-center">
      <button
        type="button"
        onClick={() => onChange(1)}
        className={[
          btnBase,
          level === 1
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
        ].join(" ")}
      >
        Lv.1
      </button>

      <button
        type="button"
        disabled={unlocked < 2}
        onClick={() => onChange(2)}
        className={[
          btnBase,
          unlocked < 2
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            : level === 2
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
        ].join(" ")}
      >
        Lv.2 {unlocked < 2 ? "🔒" : ""}
      </button>

      <button
        type="button"
        disabled={unlocked < 3}
        onClick={() => onChange(3)}
        className={[
          btnBase,
          unlocked < 3
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            : level === 3
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
        ].join(" ")}
      >
        Lv.3 {unlocked < 3 ? "🔒" : ""}
      </button>
    </div>
  );
}
