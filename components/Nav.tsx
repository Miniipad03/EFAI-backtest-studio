'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/backtest', label: 'Backtest' },
  { href: '/strategies', label: 'Strategies' },
  { href: '/about', label: 'About' },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="sticky top-0 z-50 bg-surface-card border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-8">
        <Link href="/" className="font-bold text-brand text-lg tracking-tight">
          📈 BacktestStudio
        </Link>
        <div className="flex gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                path === href
                  ? 'bg-brand text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-border'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
