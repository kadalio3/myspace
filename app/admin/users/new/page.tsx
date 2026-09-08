import { auth } from '@/auth';
import { createUser } from '@/lib/actions/user.actions';
import Link from 'next/link';
import { UserPlus, ArrowLeft, Shield, Mail, Lock, User } from 'lucide-react';

export default async function NewUserPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <Link 
          href="/admin/users"
          className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            Add New User
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Buat akun pengguna atau owner baru secara manual ke dalam sistem.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-2xl border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-8 shadow-sm dark:shadow-2xl transition-all">
        <form action={createUser} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>Full Name</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm shadow-inner"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Email Address</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="user@example.com"
              className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm shadow-inner"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span>Password</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm shadow-inner"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>User Role</span>
            </label>
            <select
              id="role"
              name="role"
              defaultValue="GUEST"
              className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm shadow-inner cursor-pointer"
            >
              <option value="GUEST" className="bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300">GUEST (Standard Reader / Commenter)</option>
              <option value="OWNER" className="bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 font-bold">OWNER (Full Admin Access)</option>
            </select>
          </div>

          <div className="pt-4 flex gap-4">
            <Link
              href="/admin/users"
              className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded-2xl py-3.5 text-sm text-center transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl py-3.5 text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
