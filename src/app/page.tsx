import { LandingHero } from "@/components/landing/LandingHero";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex justify-end p-4">
        <Link
          href="/learn"
          className="text-sm text-muted hover:text-foreground"
        >
          直接进入 →
        </Link>
      </header>
      <LandingHero />
    </main>
  );
}
