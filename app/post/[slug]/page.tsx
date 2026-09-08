import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import LikeButton from '@/components/LikeButton';
import Comments from '@/components/Comments';
import PostShareBar from '@/components/PostShareBar';
import AdSenseBanner from '@/components/AdSenseBanner';
import { Metadata } from 'next';
import { logActivity } from '@/lib/logger';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};

  const excerpt = post.content.substring(0, 160).replace(/[#*`_\[\]]/g, '').trim() + '...';
  
  return {
    title: post.title,
    description: excerpt,
    openGraph: {
      title: post.title,
      description: excerpt,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      url: `/post/${post.slug}`,
    }
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const cookieStore = await cookies();
  const guestToken = cookieStore.get('guest_token')?.value;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      user: {
        select: { name: true, avatarUrl: true }
      },
      _count: {
        select: { likes: true }
      },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, avatarUrl: true, role: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { name: true, avatarUrl: true, role: true } }
            }
          }
        }
      }
    }
  });

  if (!post) {
    notFound();
  }

  // Log traffic visit asynchronously
  logActivity({
    type: 'TRAFFIC',
    action: 'READ_POST',
    title: `Membaca artikel: "${post.title}"`,
    description: `Kategori: ${post.category} | Pembaca: ${session?.user?.name || 'Guest Reader'}`,
    userId: session?.user?.id,
    guestName: session?.user ? undefined : `Guest (${guestToken?.substring(0, 8) || 'Anon'})`,
    path: `/post/${post.slug}`
  });

  // Check if current user/guest liked
  let userLiked = false;
  if (session?.user?.id) {
    const like = await prisma.like.findFirst({ where: { postId: post.id, userId: session.user.id } });
    if (like) userLiked = true;
  } else if (guestToken) {
    const like = await prisma.like.findFirst({ where: { postId: post.id, guestToken } });
    if (like) userLiked = true;
  }

  const readTime = Math.max(1, Math.ceil(post.content.length / 800));

  return (
    <article className="container mx-auto px-4 py-16 sm:py-20 max-w-3xl animate-fade-in">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-400 mb-10">
        <Link 
          href="/posts"
          className="inline-flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Daftar Tulisan</span>
        </Link>

        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-600">
          <Link href="/" className="hover:text-slate-800 dark:hover:text-zinc-300 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href={`/posts?category=${encodeURIComponent(post.category || 'Teknologi')}`} className="hover:text-slate-800 dark:hover:text-zinc-300 transition-colors">{post.category || 'Teknologi'}</Link>
        </div>
      </div>

      <header className="mb-12">
        {/* Category Pill & Reading Time */}
        <div className="flex items-center gap-3 mb-4">
          <Link 
            href={`/posts?category=${encodeURIComponent(post.category || 'Teknologi')}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
          >
            <span>#{post.category || 'Teknologi'}</span>
          </Link>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            ⏱️ {readTime} menit baca
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-zinc-100 leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-zinc-400">
            <span>{new Date(post.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <div className="flex items-center gap-2">
              {post.user?.avatarUrl ? (
                <img src={post.user.avatarUrl} alt={post.user.name || 'Author'} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-slate-700 dark:text-zinc-300 font-bold">
                  {(post.user?.name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-slate-900 dark:text-zinc-200 font-bold">{post.user?.name || 'Kadalio'}</span>
            </div>
          </div>
          <LikeButton postId={post.id} initialLiked={userLiked} initialLikeCount={post._count.likes} />
        </div>
      </header>

      <div className="prose prose-slate dark:prose-invert dark:prose-zinc max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-zinc-100 prose-p:text-slate-700 dark:prose-p:text-zinc-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300 prose-img:rounded-2xl prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-pre:bg-slate-900 dark:prose-pre:bg-zinc-900 leading-relaxed font-normal">
        <ReactMarkdown>
          {post.content}
        </ReactMarkdown>
      </div>

      <PostShareBar 
        title={post.title}
        slug={post.slug}
        author={{ name: post.user?.name, avatarUrl: post.user?.avatarUrl }}
        category={post.category || 'Teknologi'}
      />

      <AdSenseBanner adFormat="rectangle" className="my-10" />

      <Comments 
        postId={post.id} 
        initialComments={post.comments.map((c: any) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          replies: (c.replies || []).map((r: any) => ({
            ...r,
            createdAt: r.createdAt.toISOString()
          }))
        }))} 
        isAuthenticated={!!session?.user} 
      />
    </article>
  );
}
