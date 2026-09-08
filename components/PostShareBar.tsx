'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Share2, Copy, Check, MessageCircle, ArrowRight } from 'lucide-react';

interface PostShareBarProps {
  title: string;
  slug: string;
  author: {
    name?: string | null;
    avatarUrl?: string | null;
  };
  category?: string;
}

export default function PostShareBar({ title, slug, author, category = 'Teknologi' }: PostShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(`${window.location.origin}/post/${slug}`);
    }
  }, [slug]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl || window.location.href);
      setCopied(true);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Tautan artikel berhasil disalin ke papan klip!', type: 'success' }
      }));
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const shareToWhatsApp = () => {
    const text = `*${title}*\nBaca selengkapnya di: ${currentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareToThreads = () => {
    window.open(`https://threads.net/intent/post?text=${encodeURIComponent(title + ' ' + currentUrl)}`, '_blank');
  };

  return (
    <div className="space-y-10 pt-10 mt-16 border-t border-slate-200 dark:border-zinc-800/80 animate-fade-in">
      {/* Share Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-100/80 dark:bg-zinc-900/60 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300">
          <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs sm:text-sm font-bold">Bagikan tulisan ini:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white shadow-sm scale-105'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 shadow-xs'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
          </button>

          <button
            type="button"
            onClick={shareToWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={shareToFacebook}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <span>Facebook</span>
          </button>

          <button
            type="button"
            onClick={shareToThreads}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.186 24c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.484 0 6.621 1.487 8.818 3.869l-2.613 2.502c-1.637-1.782-3.87-2.871-6.205-2.871-4.962 0-9 4.038-9 9s4.038 9 9 9c4.27 0 7.854-2.986 8.784-7.014h-8.784v-3.5h12.287c.07.58.113 1.176.113 1.786 0 6.627-5.373 12-12.4 12z" /></svg>
            <span>Threads</span>
          </button>
        </div>
      </div>

      {/* Author Box */}
      <div className="bg-white dark:bg-zinc-900/60 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 shadow-sm flex items-center justify-center font-bold text-lg text-slate-700 dark:text-zinc-300">
          {author.avatarUrl ? (
            <img src={author.avatarUrl} alt={author.name || 'Author'} className="w-full h-full object-cover" />
          ) : (
            (author.name || 'K')[0].toUpperCase()
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100 flex items-center justify-center sm:justify-start gap-2">
              <span>Ditulis oleh {author.name || 'Kadalio'}</span>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold" title="Verified Creator">✓</span>
            </h4>
            <Link
              href="/about"
              className="inline-flex items-center justify-center sm:justify-start gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Lihat Profil Penulis</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Pengembang perangkat lunak dan pencinta teknologi modern. Menghadirkan wawasan praktis, arsitektur sistem, dan catatan dokumentasi pengembangan web di {category}.
          </p>
        </div>
      </div>
    </div>
  );
}
