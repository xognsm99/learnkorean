import Link from "next/link";

type PageProps = {
  params: Promise<{ locale: string }>;
};

// 대분류 10개 정의
const CATEGORIES = [
  { group: "daily", label: "일상", labelEn: "Daily Life", emoji: "😊", gradient: "from-amber-400/30 to-orange-400/30" },
  { group: "move", label: "이동", labelEn: "Transportation", emoji: "🚇", gradient: "from-blue-400/30 to-indigo-400/30" },
  { group: "life", label: "생활", labelEn: "Living", emoji: "🏠", gradient: "from-green-400/30 to-emerald-400/30" },
  { group: "hospital", label: "병원", labelEn: "Hospital", emoji: "🏥", gradient: "from-red-400/30 to-pink-400/30" },
  { group: "bank", label: "은행", labelEn: "Bank", emoji: "🏦", gradient: "from-slate-400/30 to-gray-400/30" },
  { group: "shopping", label: "쇼핑", labelEn: "Shopping", emoji: "🛍️", gradient: "from-pink-400/30 to-rose-400/30" },
  { group: "love", label: "사랑", labelEn: "Love", emoji: "💗", gradient: "from-rose-400/30 to-red-400/30" },
  { group: "holiday", label: "휴일", labelEn: "Holiday", emoji: "🎉", gradient: "from-violet-400/30 to-purple-400/30" },
  { group: "travel", label: "여행", labelEn: "Travel", emoji: "✈️", gradient: "from-sky-400/30 to-cyan-400/30" },
  { group: "etc", label: "기타", labelEn: "Others", emoji: "🎸", gradient: "from-teal-400/30 to-emerald-400/30" },
];

export default async function ScenePracticePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 md:py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Scene Practice
            </h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-500">
              Choose a category to practice Korean
            </p>
          </div>
          <Link
            href={`/${locale}/korean-work/learn`}
            className="
              group flex items-center gap-1.5 md:gap-2
              rounded-full px-3 py-2 md:px-5 md:py-2.5
              bg-white/60 backdrop-blur-xl
              border border-white/40
              shadow-lg shadow-slate-900/5
              text-xs md:text-sm font-semibold text-slate-700
              hover:bg-white/80 hover:shadow-xl
              transition-all duration-300
            "
          >
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:-translate-x-0.5"
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

        {/* Category Cards - Desktop: 세로 리스트, Mobile: 2x5 그리드 */}
        {/* Desktop Layout */}
        <div className="hidden md:block space-y-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.group}
              href={`/${locale}/korean-work/learn/scene/${cat.group}`}
              className="block"
            >
              <div
                className={`
                  group w-full text-left
                  rounded-3xl p-5
                  bg-gradient-to-br ${cat.gradient}
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
                    className="
                      flex h-14 w-14 items-center justify-center
                      rounded-2xl bg-white/50
                      text-3xl
                      shadow-lg
                      group-hover:scale-110 group-hover:rotate-3
                      transition-transform duration-300
                    "
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-slate-900 group-hover:text-slate-800">
                      {cat.label}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-600">
                      {cat.labelEn}
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
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Layout - 2x5 Grid with horizontal layout */}
        <div className="md:hidden grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.group}
              href={`/${locale}/korean-work/learn/scene/${cat.group}`}
              className="block"
            >
              <div
                className={`
                  group w-full
                  rounded-3xl p-4
                  bg-gradient-to-br ${cat.gradient}
                  backdrop-blur-xl
                  border border-white/60
                  shadow-md shadow-slate-900/5
                  hover:shadow-lg hover:shadow-slate-900/10
                  active:scale-[0.97]
                  transition-all duration-200 ease-out
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-14 w-14 items-center justify-center flex-shrink-0
                      rounded-2xl bg-white/50
                      text-3xl
                      shadow-lg
                      group-hover:scale-105
                      transition-transform duration-200
                    "
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-base font-semibold text-slate-900 truncate">
                      {cat.label}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {cat.labelEn}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400 flex-shrink-0"
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
