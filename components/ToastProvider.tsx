'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CheckCircle2, AlertCircle, Sparkles, Trash2, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'delete' | 'sparkle';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

/**
 * Global helper to trigger toasts from anywhere in client components
 */
export function showToast(message: string, type: ToastType = 'success') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app-toast', { detail: { message, type } })
    );
  }
}

const TOAST_CONFIG: Record<ToastType, { icon: any; border: string; bg: string; text: string; iconColor: string }> = {
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-500/30',
    bg: 'bg-white/95 dark:bg-zinc-900/95',
    text: 'text-slate-900 dark:text-zinc-100',
    iconColor: 'text-emerald-500 bg-emerald-500/10'
  },
  error: {
    icon: AlertCircle,
    border: 'border-rose-500/30',
    bg: 'bg-white/95 dark:bg-zinc-900/95',
    text: 'text-slate-900 dark:text-zinc-100',
    iconColor: 'text-rose-500 bg-rose-500/10'
  },
  info: {
    icon: Info,
    border: 'border-blue-500/30',
    bg: 'bg-white/95 dark:bg-zinc-900/95',
    text: 'text-slate-900 dark:text-zinc-100',
    iconColor: 'text-blue-500 bg-blue-500/10'
  },
  delete: {
    icon: Trash2,
    border: 'border-red-500/30',
    bg: 'bg-white/95 dark:bg-zinc-900/95',
    text: 'text-slate-900 dark:text-zinc-100',
    iconColor: 'text-red-500 bg-red-500/10'
  },
  sparkle: {
    icon: Sparkles,
    border: 'border-purple-500/30',
    bg: 'bg-white/95 dark:bg-zinc-900/95',
    text: 'text-slate-900 dark:text-zinc-100',
    iconColor: 'text-purple-500 bg-purple-500/10'
  }
};

function ToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const toastParam = searchParams.get('toast');
    if (!toastParam) return;

    let message = '';
    let type: ToastType = 'success';

    switch (toastParam) {
      case 'post_created':
        message = '🎉 Artikel baru berhasil diterbitkan!';
        type = 'sparkle';
        break;
      case 'post_updated':
        message = '✨ Artikel berhasil diperbarui!';
        type = 'success';
        break;
      case 'post_deleted':
        message = '🗑️ Artikel berhasil dihapus dari sistem!';
        type = 'delete';
        break;
      case 'category_created':
        message = '🏷️ Kategori topik baru berhasil ditambahkan!';
        type = 'success';
        break;
      case 'category_deleted':
        message = '🗑️ Kategori topik berhasil dihapus!';
        type = 'delete';
        break;
      case 'story_created':
        message = '✨ Story baru berhasil dipublikasikan (24 Jam)!';
        type = 'sparkle';
        break;
      case 'story_deleted':
        message = '🗑️ Story berhasil dihapus dari arsip!';
        type = 'delete';
        break;
      case 'story_republished':
        message = '🔄 Story berhasil dipublikasikan ulang ke beranda!';
        type = 'success';
        break;
      case 'user_created':
        message = '👤 Akun user baru berhasil ditambahkan!';
        type = 'success';
        break;
      case 'user_updated':
        message = '✨ Data dan role user berhasil diperbarui!';
        type = 'success';
        break;
      case 'user_deleted':
        message = '🗑️ Akun user berhasil dihapus permanen!';
        type = 'delete';
        break;
      default:
        message = '⚡ Aksi berhasil dilakukan!';
        type = 'info';
    }

    if (message) {
      showToast(message, type);
      // Clean up URL without reloading page
      const newUrl = pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchParams, pathname]);

  return null;
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  useEffect(() => {
    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: ToastType }>;
      if (customEvent.detail) {
        addToast(customEvent.detail.message, customEvent.detail.type);
      }
    };

    window.addEventListener('app-toast', handleCustomToast);
    return () => window.removeEventListener('app-toast', handleCustomToast);
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

      {/* Floating Toast Container (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => {
          const Config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.success;
          const Icon = Config.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border ${Config.border} ${Config.bg} ${Config.text} shadow-2xl backdrop-blur-2xl animate-slide-up transition-all group`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${Config.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm font-bold leading-snug truncate">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
