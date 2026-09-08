import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Image as ImageIcon, Camera, Video, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import GalleryView from '@/components/GalleryView';

export const revalidate = 60; // Revalidate every minute for fresh media!

export const metadata = {
  title: 'Galeri Visual & Dokumentasi — Kadalio',
  description: 'Eksplorasi galeri visual, dokumentasi foto, dan video kegiatan pengembangan perangkat lunak Kadalio.'
};

export default async function GalleryPage() {
  const session = await auth();
  const isOwner = session?.user?.role === 'OWNER';

  // Fetch all media and owner profile
  const [media, owner] = await Promise.all([
    prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        type: true,
        createdAt: true,
        caption: true,
        _count: {
          select: {
            mediaLikes: true,
            mediaComments: true
          }
        },
        mediaLikes: session?.user ? {
          where: { userId: session.user.id },
          select: { id: true }
        } : undefined,
        mediaComments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            guestName: true,
            user: {
              select: { name: true, avatarUrl: true, image: true }
            }
          }
        }
      }
    }),
    prisma.user.findFirst({
      where: { role: 'OWNER' },
      select: {
        name: true,
        avatarUrl: true,
        bio: true
      }
    })
  ]);

  const formattedMedia = media.map((m: any) => ({
    id: m.id,
    url: m.url,
    type: m.type,
    createdAt: m.createdAt.toISOString(),
    caption: m.caption || null,
    likesCount: m._count.mediaLikes,
    commentsCount: m._count.mediaComments,
    isLiked: Array.isArray(m.mediaLikes) && m.mediaLikes.length > 0,
    commentsList: m.mediaComments.map((c: any) => ({
      id: c.id,
      name: c.user?.name || c.guestName || 'Visitor',
      avatar: c.user?.avatarUrl || c.user?.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      text: c.content,
      time: new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }))
  }));

  const ownerData = {
    name: owner?.name || 'Kadalio',
    avatarUrl: owner?.avatarUrl || null,
    bio: owner?.bio || '🚀 Berbagi pemikiran, eksplorasi teknologi modern, dan catatan perjalanan pengembangan perangkat lunak.'
  };

  const imageCount = media.filter((m: any) => m.type === 'IMAGE' || !m.url.match(/\.(mp4|webm|mov)$/i)).length;
  const videoCount = media.length - imageCount;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-10 md:py-16 animate-fade-in transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-8">
        
        {/* Creator Profile Header (Authentic Social Media / Portfolio Grid Style) */}
        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 dark:border-zinc-800/80 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left: Author Profile */}
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-20 h-20 rounded-full overflow-hidden p-0.5 bg-slate-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 shadow-md shrink-0">
                {ownerData.avatarUrl ? (
                  <img src={ownerData.avatarUrl} alt={ownerData.name || 'Owner'} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xl bg-slate-900 text-white rounded-full">
                    {(ownerData.name || 'K')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                    {ownerData.name || 'Kadalio'}
                  </h1>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold" title="Verified Creator">✓</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-lg leading-relaxed">
                  {ownerData.bio}
                </p>
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-400 dark:text-zinc-500">
                  <span>📸 Dokumentasi Visual</span>
                  <span>•</span>
                  <span>✨ Portofolio Interaktif</span>
                </div>
              </div>
            </div>

            {/* Right: Stats & Action */}
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
                <Camera className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                <span>{imageCount} Foto</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
                <Video className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                <span>{videoCount} Video</span>
              </div>
              {isOwner && (
                <Link
                  href="/about"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold px-5 py-2.5 rounded-2xl shadow-sm transition-all hover:scale-105 text-xs sm:text-sm border border-slate-800 dark:border-zinc-200"
                >
                  <span>+ Unggah Media</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Gallery View Component with Filter Tabs & Lightbox */}
        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-200/80 dark:border-zinc-800/80 shadow-sm">
          <GalleryView
            media={formattedMedia}
            owner={ownerData}
            showFilter={true}
            emptyMessage="Belum ada media yang diunggah ke dalam galeri ini."
            gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          />
        </div>

      </div>
    </div>
  );
}
