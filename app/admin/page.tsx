import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { FileText, Edit3, Users } from 'lucide-react';

export default async function AdminOverview() {
  const session = await auth();
  
  if (!session?.user) return null;

  const [postCount, draftCount, userCount] = await Promise.all([
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.user.count(),
  ]);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Ringkasan statistik publikasi dan pengguna di blog Anda.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Published Posts</h3>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-zinc-100">{postCount}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Drafts</h3>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-zinc-100">{draftCount}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Total Users</h3>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-zinc-100">{userCount}</p>
        </div>
      </div>
    </div>
  );
}
