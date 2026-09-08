import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { deleteStoryAction, republishStoryAction } from '@/lib/actions/story.actions';
import { History, Sparkles, Trash2, RefreshCw, Clock } from 'lucide-react';
import Link from 'next/link';

const BG_PRESETS: Record<string, string> = {
  sunset: 'bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500',
  neon: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700',
  ocean: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700',
  gold: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600',
  rose: 'bg-gradient-to-br from-rose-600 via-red-600 to-pink-700',
  dark: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-black border border-zinc-700',
};

export default async function ArchiveStoryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') return null;

  const now = new Date();

  // Find stories where expiresAt <= now
  const archivedStories = await prisma.story.findMany({
    where: {
      expiresAt: { lte: now }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      media: true,
      user: {
        select: { name: true, email: true }
      }
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent flex items-center gap-2.5">
            <History className="w-8 h-8 text-rose-500 dark:text-rose-400" />
            <span>Story Archive (&gt;24 Jam)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Daftar story yang telah melewati batas waktu 24 jam. Anda dapat mempublikasikan ulang atau menghapus permanen.
          </p>
        </div>
        <Link
          href="/admin/stories/new"
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Buat Story Baru</span>
        </Link>
      </div>

      {archivedStories.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400 dark:text-zinc-500">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200">Belum Ada Story Arsip</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Semua story yang kadaluarsa (melewati 24 jam) akan otomatis disimpan di halaman ini untuk dokumentasi Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {archivedStories.map((story: any) => {
            const mediaUrl = story.media?.[0]?.url;
            const bgClass = story.bgStyle && BG_PRESETS[story.bgStyle] ? BG_PRESETS[story.bgStyle] : BG_PRESETS.sunset;
            
            return (
              <div 
                key={story.id}
                className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                {/* Story Preview Card (9:16 Aspect ratio container) */}
                <div className="relative aspect-[9/14] w-full bg-slate-900 dark:bg-black overflow-hidden flex items-center justify-center p-4">
                  {mediaUrl ? (
                    <>
                      <img src={mediaUrl} alt="Story Archive" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {story.caption && (
                        <div className="absolute bottom-4 left-4 right-4 z-10 text-center">
                          <span className="inline-block bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-lg max-w-full truncate">
                            {story.caption}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={`absolute inset-0 w-full h-full flex items-center justify-center p-6 text-center ${bgClass}`}>
                      <p className="text-white font-extrabold text-sm sm:text-base drop-shadow-md line-clamp-6 leading-snug">
                        {story.caption || 'No Content'}
                      </p>
                    </div>
                  )}

                  {/* Expired Badge Top Right */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white/90 border border-white/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Clock className="w-3 h-3 text-rose-400" />
                    <span>Expired</span>
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/90 border-t border-slate-200 dark:border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                    <span>Dibuat: {new Date(story.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {/* Republish Form */}
                    <form 
                      action={async () => {
                        'use server';
                        await republishStoryAction(story.id);
                      }}
                      className="flex-1"
                    >
                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Aktifkan kembali selama 24 jam ke depan"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Republish 24H</span>
                      </button>
                    </form>

                    {/* Delete Form */}
                    <form 
                      action={async () => {
                        'use server';
                        await deleteStoryAction(story.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        title="Hapus Permanen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
