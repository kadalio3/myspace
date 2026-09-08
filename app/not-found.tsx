import Link from 'next/link';
import { AlertTriangle, ArrowLeft, BookOpen, User, Home, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Halaman Tidak Ditemukan | Ruang Berpikir Kadalio',
  description: 'Maaf, halaman atau artikel yang Anda cari tidak ditemukan atau telah dipindahkan.',
};

export default function NotFound() {
  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-rose-500/10 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-xl w-full text-center animate-fade-in">
        {/* Floating 404 Icon & Badge */}
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-tr from-rose-500/10 via-purple-500/10 to-blue-500/10 border border-rose-500/20 mb-6 shadow-xl relative group">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-9 h-9" />
          </div>
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
            ERROR 404
          </div>
        </div>

        {/* Large 404 Gradient Text */}
        <h1 className="text-6xl sm:text-8xl font-black tracking-tight mb-4 bg-gradient-to-r from-slate-900 via-rose-600 to-purple-600 dark:from-white dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent font-mono">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 mb-3">
          Halaman Tidak Ditemukan
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-8 font-normal">
          Maaf, artikel, kategori, atau tautan yang Anda cari mungkin telah dipindahkan, dihapus oleh penulis, atau alamat URL yang dimasukkan salah.
        </p>

        {/* Interactive Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href="/posts"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Jelajahi Semua Artikel</span>
          </Link>

          <Link
            href="/about"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-purple-500" />
            <span>Profil Penulis</span>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-6 border-t border-slate-200/60 dark:border-zinc-800/60 inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Ruang Berpikir Kadalio &bull; Sistem Navigasi Otomatis</span>
        </div>
      </div>
    </div>
  );
}
