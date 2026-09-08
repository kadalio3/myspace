import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import StoryReel from '@/components/StoryReel';
import GalleryView from '@/components/GalleryView';
import { ArrowRight, Clock, ShieldAlert, Lock, Sparkles, BookOpen, Tag, Image as ImageIcon } from 'lucide-react';

export default async function Home() {
  const session = await auth();
  const isGuest = !session?.user || session.user.role === 'GUEST';

  // Find published posts (Limit to 5 to prevent heavy database load / self-DDoS)
  const whereCondition = {
    status: 'PUBLISHED' as const,
    ...(isGuest ? { visibility: 'PUBLIC' as const } : {})
  };

  const [posts, totalCount, activeStories, media, owner] = await Promise.all([
    prisma.post.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: { name: true, avatarUrl: true, image: true }
        }
      }
    }),
    prisma.post.count({ where: whereCondition }),
    prisma.story.findMany({
      where: {
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, avatarUrl: true, image: true } },
        media: { select: { url: true } }
      }
    }),
    prisma.media.findMany({
      where: {
        OR: [
          { postId: null },
          { post: { visibility: 'PUBLIC' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
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
    prisma.user.findFirst({
      where: { role: 'OWNER' },
      select: { name: true, avatarUrl: true, bio: true }
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 selection:bg-blue-500/30 selection:text-blue-600 dark:selection:text-blue-200 transition-colors duration-300">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-blue-500/10 dark:from-blue-600/10 via-purple-500/5 dark:via-purple-600/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 max-w-7xl">
        {/* Story Reel Section */}
        <div className="mb-6 border-b border-slate-200/80 dark:border-zinc-800/60 pb-2">
          <StoryReel
            stories={activeStories.map((s: any) => ({
              ...s,
              user: {
                ...s.user,
                avatarUrl: s.user.avatarUrl || s.user.image || null
              },
              createdAt: s.createdAt.toISOString()
            }))}
            isOwner={session?.user?.role === 'OWNER'}
          />
        </div>

        {/* Hero Section */}
        <section className="py-6 md:py-4 text-center mb-12 relative">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent max-w-3xl mx-auto leading-tight">
            Ruang Berpikir <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Kadalio</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Selamat datang di ruang pemikiran pribadi saya. Disini tempat saya berbagi pemikiran, dokumentasi visual, dan karya-karya saya.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6">
            <Link
              href="/posts"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm shadow-lg shadow-slate-900/10 dark:shadow-white/10 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Jelajahi Artikel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/gallery"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Galeri Visual</span>
            </Link>
            <Link
              href="/about"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-zinc-800 transition-all hover:scale-105 shadow-sm"
            >
              Tentang Penulis
            </Link>
          </div>
        </section>

        {/* Feed Section */}
        <section id="articles" className="max-w-4xl mx-auto scroll-mt-20">
          <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">Tulisan Terbaru</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">Artikel yang baru saja dipublikasikan</p>
              </div>
            </div>
            <Link
              href="/posts"
              className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-full text-blue-600 dark:text-blue-400 shadow-sm transition-colors flex items-center gap-1"
            >
              <span>Lihat Semua ({totalCount})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid gap-5">
            {posts.map((post: any) => {
              const readTime = Math.max(1, Math.ceil(post.content.length / 800));
              const avatar = post.user?.avatarUrl || post.user?.image;
              const isPrivate = post.visibility === 'PRIVATE';
              const isPassword = post.visibility === 'PASSWORD_PROTECTED';

              return (
                <Link key={post.id} href={`/post/${post.slug}`} className="block group">
                  <article className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 group-hover:-translate-y-0.5">
                    {/* Top Meta: Category & Visibility */}
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Tag className="w-3 h-3" />
                          {post.category || 'Teknologi'}
                        </span>

                        <span className="text-slate-300 dark:text-zinc-700">•</span>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-zinc-300">
                            {avatar ? (
                              <img src={avatar} alt="Author" className="w-full h-full object-cover" />
                            ) : (
                              (post.user?.name || 'A')[0].toUpperCase()
                            )}
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-zinc-400">
                            {post.user?.name || 'Kadalio'}
                          </span>
                        </div>

                        <span className="text-slate-300 dark:text-zinc-700">•</span>

                        <span className="text-xs text-slate-500 dark:text-zinc-500">
                          {new Date(post.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPrivate && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <ShieldAlert className="w-3 h-3" />
                            Private
                          </span>
                        )}
                        {isPassword && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            <Lock className="w-3 h-3" />
                            Protected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Excerpt */}
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 line-clamp-2 mb-5 leading-relaxed font-normal">
                      {post.content.replace(/[#*`_\[\]]/g, '').substring(0, 220)}...
                    </p>

                    {/* Bottom Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-500 pt-3.5 border-t border-slate-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                        <span>{readTime} min read</span>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Baca selengkapnya &rarr;
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}

            {posts.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-zinc-900/20 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-zinc-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-zinc-300 mb-1">Belum Ada Artikel</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-500 max-w-sm mx-auto">
                  Artikel yang dipublikasikan akan muncul di sini. Cek kembali nanti untuk membaca tulisan terbaru!
                </p>
              </div>
            )}
          </div>

          {totalCount > 5 && (
            <div className="mt-8 text-center">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-sm shadow-lg transition-all hover:scale-105"
              >
                <span>📚 Lihat Semua Artikel ({totalCount}) &rarr;</span>
              </Link>
            </div>
          )}
        </section>

        {/* Social Media Style Gallery Section (Moved Below Articles) */}
        {formattedMedia.length > 0 && (
          <section className="max-w-4xl mx-auto mt-16 mb-14 animate-fade-in">
            {/* Clean Glass Gallery Container */}
            <div className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-[32px] border border-slate-200/80 dark:border-zinc-800/80 shadow-xl shadow-slate-900/5 dark:shadow-black/20 relative overflow-hidden">
              {/* Creator Profile Banner inside Gallery Box */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-zinc-800/80 relative z-10">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-md shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900 border-2 border-white dark:border-zinc-900">
                      {ownerData.avatarUrl ? (
                        <img src={ownerData.avatarUrl} alt={ownerData.name || 'Owner'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-purple-600 text-white">
                          {(ownerData.name || 'K')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 font-extrabold text-slate-900 dark:text-zinc-100 text-sm sm:text-base">
                      <span>{ownerData.name || 'Kadalio'}</span>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[9px]">✓</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 max-w-xs sm:max-w-md">
                      {ownerData.bio}
                    </p>
                  </div>
                </div>

                <Link
                  href="/gallery"
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2 shrink-0 cursor-pointer border border-slate-800 dark:border-zinc-200"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Buka Galeri Penuh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Interactive Grid View */}
              <div className="relative z-10">
                <GalleryView
                  media={formattedMedia}
                  owner={ownerData}
                  showFilter={false}
                  gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
