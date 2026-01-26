import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Speak Korean for Work — Fast
        </h1>
        <p className="text-xl text-gray-600">
          Learn the exact phrases you need for deliveries, work, hospitals, and daily life in Korea.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/ko/korean-work"
            className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-all hover:scale-105"
          >
            Start in 60 seconds
          </Link>
          <p className="text-sm text-gray-500">
            No textbook. Just real conversations.
          </p>
        </div>
      </div>
    </div>
  );
}
