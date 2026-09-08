import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Plus, FileText, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { deletePostAction } from '@/lib/actions/post.actions';

interface AdminPostsProps {
  searchParams?: Promise<{
    page?: string;
  }>;
}

export default async function AdminPosts({ searchParams }: AdminPostsProps) {
  const session = await auth();
  
  if (!session?.user) return null;

  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page || '1', 10));
  const pageSize = 10; // Limit 10 to prevent self-DDoS on admin table
  const skip = (page - 1) * pageSize;

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip,
    }),
    prisma.post.count()
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            Posts Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Kelola daftar seluruh artikel blog Anda (Menampilkan {posts.length} dari total {totalCount} artikel).
          </p>
        </div>
        <Link 
          href="/admin/posts/new"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/50">
              {posts.map((post: any) => (
                <tr key={post.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500/80 flex-shrink-0" />
                    <span>{post.title}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-zinc-300">
                    <span className="bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700">
                      {post.category || 'Teknologi'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border
                      ${post.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                        post.status === 'DRAFT' ? 'bg-slate-500/10 text-slate-600 dark:text-zinc-400 border-slate-500/20' : 
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-zinc-400">{post.visibility}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/posts/${post.id}/edit`}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                        title="Edit Artikel"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>

                      <form
                        action={async () => {
                          'use server';
                          await deletePostAction(post.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-zinc-500">
                    Belum ada artikel yang dibuat. Klik tombol "New Post" untuk mulai menulis!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Link
            href={`/admin/posts?page=${Math.max(1, page - 1)}`}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </Link>

          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            Halaman <strong className="text-slate-900 dark:text-zinc-100">{page}</strong> dari <strong className="text-slate-900 dark:text-zinc-100">{totalPages}</strong> (Total: {totalCount})
          </span>

          <Link
            href={`/admin/posts?page=${Math.min(totalPages, page + 1)}`}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
