import "../../../styles/korean-work.css";
import { AuthProvider } from "@/app/components/auth/AuthProvider";
import UserMenu from "@/app/components/auth/UserMenu";

export default function KoreanWorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <main className="kw">
        <nav className="glass-nav">
          <div className="kw-container">
            <div className="flex items-center justify-between py-4">
              <h1 className="text-2xl font-bold" style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                Korean Work
              </h1>
              <div className="flex items-center gap-4">
                <a href="/ko/korean-work" className="glass-caption hover:opacity-80 transition-opacity">
                  Home
                </a>
                <a href="/ko/korean-work/learn" className="glass-caption hover:opacity-80 transition-opacity">
                  Learn
                </a>
                <a href="/ko/korean-work/review" className="glass-caption hover:opacity-80 transition-opacity">
                  Review
                </a>
                <UserMenu />
              </div>
            </div>
          </div>
        </nav>
        {children}
      </main>
    </AuthProvider>
  );
}
