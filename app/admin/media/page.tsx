import { prisma } from '@/lib/prisma';
import AdminMediaManager from '@/components/AdminMediaManager';
import { Image as ImageIcon, Sparkles, FolderUp } from 'lucide-react';

export const revalidate = 0; // Always fresh in admin panel!

export const metadata = {
  title: 'Manajemen Galeri & Media — Owner Panel',
  description: 'Kelola foto, video, dan dokumentasi visual blog pribadi Kadalio.'
};

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      post: {
        select: { title: true }
      }
    }
  });

  const totalSizeBytes = media.reduce((acc: number, m: any) => acc + m.sizeBytes, 0);

  const formattedMedia = media.map((m: any) => ({
    id: m.id,
    url: m.url,
    type: m.type,
    publicId: m.publicId,
    mimeType: m.mimeType,
    sizeBytes: m.sizeBytes,
    createdAt: m.createdAt.toISOString(),
    postId: m.postId,
    storyId: m.storyId,
    postTitle: m.post?.title || null,
    caption: m.caption || null
  }));

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20 mb-2.5">
            <FolderUp className="w-3.5 h-3.5" />
            <span>Pusat Konten Visual</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            Manajemen Galeri &amp; Media
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Unggah foto/video secara mandiri (*standalone*), kelola file server, dan bersihkan media yang tidak terpakai.
          </p>
        </div>
      </div>

      {/* Interactive Media Manager Component */}
      <AdminMediaManager
        mediaList={formattedMedia}
        totalSizeBytes={totalSizeBytes}
      />
    </div>
  );
}
