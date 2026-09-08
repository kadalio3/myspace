import { createPost } from '@/lib/actions/post.actions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import PostForm from '@/components/PostForm';

export default async function NewPostPage() {
  const dbCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            Create New Post
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Tulis dan terbitkan artikel baru untuk blog Anda.</p>
        </div>
        <Link 
          href="/admin/posts"
          className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl text-xs font-semibold transition-all shadow-sm"
        >
          Cancel
        </Link>
      </div>

      <PostForm 
        action={createPost} 
        submitLabel="Publish Post" 
        categories={dbCategories.map((c: any) => c.name)}
      />
    </div>
  );
}
