import Link from 'next/link';
import { auth, signOut } from '@/auth';
import ThemeToggle from './ThemeToggle';

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
            <span className="text-white font-extrabold text-lg leading-none">K</span>
          </div>
          <span className="font-bold tracking-tight hidden sm:inline-block text-lg bg-gradient-to-r from-slate-900 to-slate-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
            Kadalio
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-zinc-100 transition-colors">
            Beranda
          </Link>
          <Link href="/posts" className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-zinc-100 transition-colors flex items-center gap-1">
            <span>Artikel</span>
          </Link>
          <Link href="/gallery" className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-zinc-100 transition-colors">
            Galeri
          </Link>
          <Link href="/about" className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-zinc-100 transition-colors">
            Tentang
          </Link>

          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800/80 mx-1" />

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.role === 'OWNER' && (
                <Link
                  href="/admin"
                  className="px-3.5 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all shadow-sm"
                >
                  Dashboard
                </Link>
              )}
              <form
                action={async () => {
                  'use server';
                  await signOut();
                }}
              >
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
      </div>
    </header>
  );
}
