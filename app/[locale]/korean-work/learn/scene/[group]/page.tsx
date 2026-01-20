import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type PageProps = {
  params: Promise<{ locale: string; group: string }>;
};

// 대분류별 메타 정보
const GROUP_META: Record<string, { label: string; labelEn: string; emoji: string; gradient: string }> = {
  daily: { label: "일상", labelEn: "Daily Life", emoji: "😊", gradient: "from-amber-400/30 to-orange-400/30" },
  move: { label: "이동", labelEn: "Transportation", emoji: "🚇", gradient: "from-blue-400/30 to-indigo-400/30" },
  life: { label: "생활", labelEn: "Living", emoji: "🏠", gradient: "from-green-400/30 to-emerald-400/30" },
  hospital: { label: "병원", labelEn: "Hospital", emoji: "🏥", gradient: "from-red-400/30 to-pink-400/30" },
  bank: { label: "은행", labelEn: "Bank", emoji: "🏦", gradient: "from-slate-400/30 to-gray-400/30" },
  shopping: { label: "쇼핑", labelEn: "Shopping", emoji: "🛍️", gradient: "from-pink-400/30 to-rose-400/30" },
  love: { label: "사랑", labelEn: "Love", emoji: "💗", gradient: "from-rose-400/30 to-red-400/30" },
  holiday: { label: "휴일", labelEn: "Holiday", emoji: "🎉", gradient: "from-violet-400/30 to-purple-400/30" },
  travel: { label: "여행", labelEn: "Travel", emoji: "✈️", gradient: "from-sky-400/30 to-cyan-400/30" },
  etc: { label: "기타", labelEn: "Others", emoji: "🎸", gradient: "from-teal-400/30 to-emerald-400/30" },
};

// 토픽별 이모지 매핑 (slug 기준)
const TOPIC_EMOJI: Record<string, string> = {
  // 일상 (daily)
  "daily-intro": "👋",
  "daily-appointment": "📅",
  "daily-phone": "📞",
  "daily-help": "🙏",
  "daily-thanks": "🙇",
  "daily-neighborhood": "🏘️",
  // 이동 (move)
  "move-bus": "🚌",
  "move-subway": "🚇",
  "move-taxi": "🚕",
  "move-train": "🚄",
  "move-direction": "🧭",
  // 생활 (life)
  "life-mart": "🛒",
  "life-restaurant": "🍽️",
  "life-cafe": "☕",
  "life-delivery": "📦",
  "life-laundry": "🧺",
  "life-haircut": "💇",
  // 병원 (hospital)
  "hospital-reception": "🏥",
  "hospital-symptom": "🤒",
  "hospital-pharmacy": "💊",
  "hospital-emergency": "🚑",
  // 은행 (bank)
  "bank-account": "💳",
  "bank-transfer": "💸",
  "bank-atm": "🏧",
  "bank-loan": "📋",
  // 쇼핑 (shopping)
  "shopping-clothes": "👕",
  "shopping-exchange": "🔄",
  "shopping-online": "🖥️",
  "shopping-bargain": "💰",
  // 사랑 (love)
  "love-confess": "💕",
  "love-date": "💑",
  "love-breakup": "💔",
  "love-marriage": "💒",
  // 휴일 (holiday)
  "holiday-plan": "📝",
  "holiday-party": "🎊",
  "holiday-birthday": "🎂",
  "holiday-newyear": "🎆",
  // 여행 (travel)
  "travel-airport": "🛫",
  "travel-hotel": "🏨",
  "travel-tour": "🗺️",
  "travel-photo": "📸",
  // 기타 (etc)
  "etc-weather": "🌤️",
  "etc-hobby": "🎨",
  "etc-sports": "⚽",
  "etc-music": "🎵",
};

// 토픽 제목 키워드 기반 이모지 매핑 (slug에 없을 경우 fallback)
function getTopicEmoji(slug: string, title: string, groupEmoji: string): string {
  // 1. slug 직접 매핑 확인
  if (TOPIC_EMOJI[slug]) {
    return TOPIC_EMOJI[slug];
  }

  // 2. 제목 키워드 기반 매핑
  const titleLower = title.toLowerCase();
  const keywords: Record<string, string> = {
    // 인사/소개
    "인사": "👋", "소개": "👋", "자기소개": "🙋",
    // 약속/시간
    "약속": "📅", "시간": "⏰",
    // 전화/메시지
    "전화": "📞", "메시지": "💬", "연락": "📱",
    // 도움/요청
    "도움": "🙏", "요청": "🙏", "부탁": "🤝",
    // 감사/사과
    "감사": "🙇", "사과": "🙇", "고마움": "💝", "미안": "😔",
    // 동네/주변
    "동네": "🏘️", "주변": "📍", "위치": "🗺️",
    // 이동/교통
    "버스": "🚌", "지하철": "🚇", "택시": "🚕", "기차": "🚄",
    "길찾기": "🔎", "도보": "👫", "횡단보도": "👫", "기타 이동": "🛴", "기타이동": "🛴",
    // 생활
    "마트": "🛒", "식당": "🍽️", "카페": "☕", "배달": "📦",
    "집/생활": "🙆‍♂️", "집": "🙆‍♂️", "세탁": "🌈", "청소": "✨", "정리": "✨",
    "고장": "🔧", "수리": "🔧", "전기": "👨‍🔧", "가스": "👨‍🔧", "수도": "👨‍🔧", "택배": "📦",
    // 병원
    "병원 접수": "📄", "접수": "📄", "증상": "🤒", "약국": "💊", "응급": "🚑",
    "치과": "😷", "건강검진": "💪", "검진": "💪",
    // 은행
    "계좌": "💵", "개설": "💵", "송금": "💸", "이체": "💸", "ATM": "🏧",
    "카드": "💳", "수수료": "💲", "환전": "💱", "환불": "💲",
    // 쇼핑
    "편의점": "🏪", "옷가게": "👕", "옷": "👕", "교환": "🔄", "온라인": "🖥️", "할인": "💰",
    // 사랑
    "고백": "💕", "데이트": "💑", "이별": "💔", "결혼": "💒",
    "칭찬": "👍", "거절": "🖐️", "경계": "🖐️",
    // 휴일
    "계획": "📝", "파티": "🎊", "생일": "🎂", "새해": "🎆",
    "영화": "🎬", "공연": "🎬", "공원": "🌳", "산책": "🌳", "운동": "⚽",
    // 여행
    "공항": "🛫", "호텔": "🏨", "관광": "🗺️", "사진": "📸",
    "여행지 이동": "🚗", "여행지": "🚗", "티켓": "🎫",
    // 기타
    "날씨": "🌤️", "취미": "🎨", "음악": "🎵",
    "긴급": "🚨", "긴급상황": "🆘",
    "분실": "🔍", "찾기": "🔎", "신고": "📢", "문의": "❓",
    "민원": "📋", "항의": "😤", "불만": "😠", "해결": "✅",
    "문화": "🎭", "예절": "🙏", "매너": "🤝",
    "서류": "📄", "비자": "🛂", "신분": "🪪", "확인": "✔️",
  };

  for (const [keyword, emoji] of Object.entries(keywords)) {
    if (titleLower.includes(keyword) || title.includes(keyword)) {
      return emoji;
    }
  }

  // 3. 기본값: 그룹 이모지
  return groupEmoji;
}

type Topic = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  order_no?: number | null;
  created_at?: string | null;
};

export default async function GroupPage({ params }: PageProps) {
  const { locale, group } = await params;
  const meta = GROUP_META[group] || { label: group, labelEn: group, emoji: "📚", gradient: "from-slate-400/30 to-gray-400/30" };

  // Fetch topics where slug starts with "{group}-"
  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, slug, subtitle, order_no, created_at")
    .like("slug", `${group}-%`)
    .order("order_no", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  const topicList: Topic[] = topics || [];

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{meta.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {meta.label}
              </h1>
              <p className="mt-1 text-slate-500">{meta.labelEn}</p>
            </div>
          </div>
          <Link
            href={`/${locale}/korean-work/learn/scene`}
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

        {/* Topic list or empty state */}
        {topicList.length === 0 ? (
          <div
            className="
              rounded-3xl p-8
              bg-white/70 backdrop-blur-2xl
              border border-white/50
              shadow-2xl shadow-slate-900/10
              text-center
            "
          >
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Coming Soon
            </h2>
            <p className="text-slate-500 mb-6">
              Topics for this category are being prepared.
            </p>
            <Link
              href={`/${locale}/korean-work/learn/scene`}
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
              Browse Categories
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {topicList.map((topic) => (
              <Link
                key={topic.id}
                href={`/${locale}/korean-work/learn/scene/${group}/${topic.slug}`}
                className="block"
              >
                <div
                  className={`
                    group w-full text-left
                    rounded-3xl p-5
                    bg-gradient-to-br ${meta.gradient}
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
                        flex h-12 w-12 items-center justify-center
                        rounded-xl bg-white/50
                        text-2xl
                        shadow
                        group-hover:scale-110
                        transition-transform duration-300
                      "
                    >
                      {getTopicEmoji(topic.slug, topic.title, meta.emoji)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 truncate">
                        {topic.title}
                      </div>
                      {topic.subtitle && (
                        <div className="mt-0.5 text-sm text-slate-600 truncate">
                          {topic.subtitle}
                        </div>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
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
        )}
      </div>
    </div>
  );
}
