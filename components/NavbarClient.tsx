'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarClientProps {
  user: {
    name: string | null;
    role: string;
  } | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/posts', label: 'Artikel' },
    { href: '/gallery', label: 'Galeri' },
    { href: '/about', label: 'Tentang' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
            <span className="text-white font-extrabold text-lg leading-none">K</span>
          </div>
          <span className="font-bold tracking-tight hidden sm:inline-block text-lg bg-gradient-to-r from-slate-900 to-slate-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
            Kadalio
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4 sm:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-zinc-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800/80 mx-1" />

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'OWNER' && (
                <Link
                  href="/admin"
                  className="px-3.5 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all shadow-sm"
                >
                  Dashboard
                </Link>
              )}
              <form action="/api/auth/signout" method="POST">
                <button className="text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105 border border-white/10"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile: Theme toggle + Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl animate-fade-in">
          <nav className="container mx-auto px-4 py-4 space-y-1 max-w-7xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-slate-200 dark:border-zinc-800/60 my-2" />

            {user ? (
              <>
                {user.role === 'OWNER' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-sm font-semibold text-purple-600 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 transition-all"
                  >
                    ⚙️ Dashboard Admin
                  </Link>
                )}
                <form action="/api/auth/signout" method="POST">
                  <button
                    className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-bold text-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
