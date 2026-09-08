import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import AboutProfile from '@/components/AboutProfile';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Penulis - Profile & Galeri',
  description: 'Halaman profil dan portfolio bergaya Instagram. Menampilkan sorotan topik, statistik artikel, galeri foto/video, dan cerita perjalanan.',
};

export default async function AboutPage() {
  const session = await auth();
  const isOwner = session?.user?.role === 'OWNER';

  const [ownerDb, categoriesDb, postCountsByCat, mediaDb, posts, storiesDb, totalLikes, totalComments] = await Promise.all([
    prisma.user.findFirst({ where: { role: 'OWNER' } }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { postCategories: true }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.post.groupBy({
      by: ['category'],
      where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
      _count: {
        category: true
      }
    }),
    prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 32,
      select: {
        id: true,
        url: true,
        type: true,
        createdAt: true,
        caption: true,
        _count: {
          select: { mediaLikes: true, mediaComments: true }
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
    prisma.post.findMany({
      where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { likes: true, comments: true }
        }
      }
    }),
    prisma.story.findMany({
      where: {
        expiresAt: { gt: new Date() },
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, avatarUrl: true, image: true } },
        media: true
      }
    }),
    prisma.like.count(),
    prisma.comment.count()
  ]);

  const owner = {
    name: ownerDb?.name || 'Kadalio',
    email: ownerDb?.email || 'contact@kadalio.com',
    avatarUrl: ownerDb?.avatarUrl || ownerDb?.image || null,
    bio: ownerDb?.bio || '🚀 Berbagi pemikiran, eksplorasi teknologi modern, dan catatan perjalanan pengembangan perangkat lunak.',
    role: ownerDb?.role || 'OWNER'
  };

  // Map post counts from post.category string field as well as relation table
  const countMap = new Map<string, number>(
    postCountsByCat.map((item: any) => [(item.category || '').toLowerCase().trim(), Number(item._count?.category || 0)])
  );

  const categories = categoriesDb.map((c: any) => {
    const byString = Number(countMap.get(c.name.toLowerCase().trim()) || 0);
    const byRelation = Number(c._count?.postCategories || 0);
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      color: c.color,
      postCount: Math.max(byString, byRelation)
    };
  });

  const media = mediaDb.map((m: any) => ({
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

  const formattedPosts = posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category || 'Teknologi',
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    coverImageUrl: post.coverImageUrl || null,
  }));

  const formattedStories = storiesDb.map((s: any) => ({
    id: s.id,
    caption: s.caption,
    bgStyle: s.bgStyle,
    createdAt: s.createdAt.toISOString(),
    user: {
      name: s.user.name,
      avatarUrl: s.user.avatarUrl,
      image: s.user.image,
    },
    media: s.media.map((m: any) => ({ url: m.url }))
  }));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-300">
      <AboutProfile 
        owner={owner}
        categories={categories}
        media={media}
        posts={formattedPosts}
        stories={formattedStories}
        totalPosts={posts.length}
        totalLikes={totalLikes}
        totalComments={totalComments}
        isOwner={isOwner}
      />
    </main>
  );
}
