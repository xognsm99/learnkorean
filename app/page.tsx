import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Korean Work Platform
        </h1>
        <p className="text-xl text-gray-600">
          Apple-style Glassmorphism Design
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/ko/korean-work"
            className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-all hover:scale-105"
          >
            한국어로 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
