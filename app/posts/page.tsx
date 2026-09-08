import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import PostArchive from '@/components/PostArchive';
import { BookOpen, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Artikel | Kadalio Blog',
  description: 'Arsip lengkap seluruh tulisan, eksplorasi teknologi, dan catatan perjalanan Kadalio.',
};

interface PostsPageProps {
  searchParams?: Promise<{
    page?: string;
    category?: string;
    q?: string;
  }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const session = await auth();
  const isGuest = !session?.user || session.user.role === 'GUEST';

  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page || '1', 10));
  const categoryParam = params?.category !== 'Semua' && params?.category ? params.category : undefined;
  const q = params?.q?.trim() || undefined;

  const pageSize = 10; // Limit to 10 posts per page to prevent heavy database load / self-DDoS
  const skip = (page - 1) * pageSize;

  const whereCondition: any = {
    status: 'PUBLISHED',
    ...(isGuest ? { visibility: 'PUBLIC' } : {}),
    ...(categoryParam ? { category: categoryParam } : {}),
    ...(q ? {
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
        { category: { contains: q } },
      ]
    } : {})
  };

  const [posts, totalCount, allCategories] = await Promise.all([
    prisma.post.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip,
      include: {
        user: {
          select: { name: true, avatarUrl: true, image: true }
        }
      }
    }),
    prisma.post.count({ where: whereCondition }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ]);

  const formattedPosts = posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    slug: post.slug,
    category: post.category || 'Teknologi',
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    user: {
      name: post.user.name,
      avatarUrl: post.user.avatarUrl,
      image: post.user.image,
    }
  }));

  const categoryNames: string[] = ['Semua', ...Array.from(new Set<string>(allCategories.map((c: any) => String(c.name))))];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 py-8 md:py-16 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-200/80 dark:bg-zinc-800/80 text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-4 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Catatan & Tulisan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 mb-3">
            Tulisan <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Kadalio</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
            Kumpulan pemikiran, tutorial teknis, dan dokumentasi eksplorasi seputar dunia pengembangan perangkat lunak.
          </p>
        </div>

        {/* Post Archive Interactive Component */}
        <PostArchive 
          posts={formattedPosts}
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          categories={categoryNames}
          initialCategory={categoryParam || 'Semua'}
          initialQuery={q || ''}
        />
      </div>
    </div>
  );
}
