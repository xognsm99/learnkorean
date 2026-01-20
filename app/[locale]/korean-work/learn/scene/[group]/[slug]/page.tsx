import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ScenePracticeClient from "../../ScenePracticeClient";

type PageProps = {
  params: Promise<{ locale: string; group: string; slug: string }>;
};

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function SlugPage({ params }: PageProps) {
  const { locale, group, slug } = await params;

  // 1. Fetch topic by slug
  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, slug, subtitle")
    .eq("slug", slug)
    .single();

  // Topic not found
  if (!topic) {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="mx-auto w-full max-w-lg">
          <div
            className="
              rounded-3xl p-8
              bg-white/70 backdrop-blur-2xl
              border border-white/50
              shadow-2xl shadow-slate-900/10
              text-center
            "
          >
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Topic Not Found
            </h2>
            <p className="text-slate-500 mb-6">
              The requested topic does not exist.
            </p>
            <Link
              href={`/${locale}/korean-work/learn/scene/${group}`}
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
              Back to Topics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Fetch topic_items (is_active=true, random 10)
  const { data: items } = await supabase
    .from("topic_items")
    .select("*")
    .eq("topic_id", topic.id)
    .eq("is_active", true);

  const allItems = items || [];
  const shuffledItems = shuffle(allItems).slice(0, 10);

  // No items available
  if (shuffledItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="mx-auto w-full max-w-lg">
          <div
            className="
              rounded-3xl p-8
              bg-white/70 backdrop-blur-2xl
              border border-white/50
              shadow-2xl shadow-slate-900/10
              text-center
            "
          >
            <div className="text-5xl mb-4">🚧</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Coming Soon
            </h2>
            <p className="text-slate-500 mb-2">
              <span className="font-medium">{topic.title}</span>
            </p>
            <p className="text-slate-500 mb-6">
              Questions are being prepared for this topic.
            </p>
            <Link
              href={`/${locale}/korean-work/learn/scene/${group}`}
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
              Back to Topics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render quiz session
  return (
    <ScenePracticeClient
      initialItems={shuffledItems}
      initialTopicId={topic.id}
      topicTitle={topic.title}
      locale={locale}
      group={group}
    />
  );
}
