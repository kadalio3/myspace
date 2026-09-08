import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Activity, Globe, Zap, Heart, Shield } from 'lucide-react';
import LogsViewer from '@/components/LogsViewer';

export const revalidate = 0; // Always fresh logs!

export default async function AdminLogsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    redirect('/');
  }

  // Fetch top 200 latest activity logs
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          avatarUrl: true
        }
      }
    }
  });

  const formattedLogs = logs.map((l: any) => ({
    ...l,
    createdAt: l.createdAt.toISOString()
  }));

  // Calculate quick stats
  const totalLogs = logs.length;
  const trafficCount = logs.filter((l: any) => l.type === 'TRAFFIC').length;
  const actionCount = logs.filter((l: any) => l.type === 'ACTION').length;
  const engagementCount = logs.filter((l: any) => l.type === 'ENGAGEMENT').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>Real-time Audit & Visit Tracking</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span>Log Interaktif & Kunjungan Sistem</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Pantau seluruh jejak kunjungan pembaca, pembuatan artikel/story, like, komentar, serta keamanan akun secara real-time.
        </p>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900/60 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 block">Total Aktivitas</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalLogs}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 block">Kunjungan / Baca</span>
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{trafficCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 block">Aksi Admin</span>
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{actionCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 block">Interaksi (Like/Komen)</span>
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{engagementCount}</span>
          </div>
        </div>
      </div>

      {/* Interactive Viewer Component */}
      <LogsViewer initialLogs={formattedLogs} />
    </div>
  );
}
