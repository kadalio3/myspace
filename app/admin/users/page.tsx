import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import UserRow from '@/components/UserRow';
import Link from 'next/link';
import { UserPlus, Users } from 'lucide-react';

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') return null;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Kelola peran, izin, dan tambahkan akun pengguna baru ke dalam platform Anda.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2 shadow-sm">
            <Users className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>Total Users: {users.length}</span>
          </div>
          <Link
            href="/admin/users/new"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/50">
              {users.map((user: any) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  currentUserId={session.user.id} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
