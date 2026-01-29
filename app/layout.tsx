import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://korean-work.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Korean Work - Learn Korean for the Workplace",
    template: "%s | Korean Work",
  },
  description:
    "Master Korean language skills for the workplace. Interactive lessons including Hangul basics, vocabulary building, and job interview preparation.",
  keywords: [
    "Korean",
    "Learn Korean",
    "Korean language",
    "Hangul",
    "Korean vocabulary",
    "Korean job interview",
    "Korean for work",
    "Korean lessons",
    "한국어",
    "한글",
  ],
  authors: [{ name: "Korean Work" }],
  creator: "Korean Work",
  publisher: "Korean Work",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Korean Work",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ko_KR",
    url: siteUrl,
    siteName: "Korean Work",
    title: "Korean Work - Learn Korean for the Workplace",
    description:
      "Master Korean language skills for the workplace. Interactive lessons including Hangul basics, vocabulary building, and job interview preparation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Korean Work - Learn Korean for the Workplace",
    description:
      "Master Korean language skills for the workplace. Interactive lessons including Hangul basics, vocabulary building, and job interview preparation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
