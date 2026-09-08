'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 transition-colors">
      <div className="max-w-md w-full text-center animate-fade-in">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 mb-2 tracking-tight">
          Terjadi Kesalahan
        </h2>
        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-8 leading-relaxed max-w-sm mx-auto">
          Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi atau kembali ke beranda.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-slate-400 dark:text-zinc-600 mb-6 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg inline-block">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-sm border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
