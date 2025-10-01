import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PrayerUp – Dhaka',
  description: 'Track Salah with friends in rooms with heatmaps – built for Dhaka.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <header className="sticky top-0 z-50 border-b border-white/10 bg-bg/80 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              <span className="text-accent">Prayer</span><span className="text-neon">Up</span>
            </Link>
            <nav className="flex gap-4 text-sm text-muted">
              <Link href="/history">History</Link>
              <Link href="/leaderboard">Leaderboard</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-white/10 py-6 text-center text-xs text-muted">
          Built for Dhaka • Created by <span className="text-accent font-medium">Musfique Uddin</span>
        </footer>
      </body>
    </html>
  );
}
