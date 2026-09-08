import { updatePost } from '@/lib/actions/post.actions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostForm from '@/components/PostForm';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, dbCategories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ]);

  if (!post) {
    notFound();
  }

  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            Edit Post
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Perbarui konten atau ubah status publikasi artikel.</p>
        </div>
        <Link 
          href="/admin/posts"
          className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl text-xs font-semibold transition-all shadow-sm"
        >
          Cancel
        </Link>
      </div>

      <PostForm 
        action={updatePostWithId} 
        submitLabel="Update Post" 
        categories={dbCategories.map((c: any) => c.name)}
        initialData={{
          id: post.id,
          title: post.title,
          status: post.status,
          visibility: post.visibility,
          content: post.content,
          category: post.category
        }}
      />
    </div>
  );
}
