import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { ThemeProvider } from "@/components/settings/ThemeProvider";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AILingo - Learn AI & LLM with AI-generated micro-lessons",
  description: "Turn papers, URLs, and topics into bite-sized lessons. Duolingo-style for AI/ML. Concept cards, quizzes, progress tracking. Mobile-first.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#58CC02",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${nunito.variable} antialiased font-sans`}>
        <ThemeProvider>
          <MobileContainer>
            {children}
          </MobileContainer>
          <BottomNav />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
