'use client';

import { useState, useTransition, useMemo } from 'react';
import { clearAllLogsAction, deleteLogAction } from '@/lib/actions/log.actions';
import { 
  Globe, 
  Zap, 
  Heart, 
  Shield, 
  Search, 
  Trash2, 
  ExternalLink, 
  User as UserIcon, 
  Clock, 
  Filter, 
  AlertCircle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface LogItem {
  id: string;
  type: 'TRAFFIC' | 'ACTION' | 'ENGAGEMENT' | 'SECURITY';
  action: string;
  title: string;
  description: string | null;
  guestName: string | null;
  ipAddress: string | null;
  path: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  } | null;
}

interface LogsViewerProps {
  initialLogs: LogItem[];
}

const TYPE_CONFIG = {
  TRAFFIC: {
    label: 'Kunjungan & Pembaca',
    icon: Globe,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    badge: 'bg-blue-500 text-white',
  },
  ACTION: {
    label: 'Aksi Admin & Konten',
    icon: Zap,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    badge: 'bg-purple-500 text-white',
  },
  ENGAGEMENT: {
    label: 'Interaksi & Like/Komen',
    icon: Heart,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    badge: 'bg-rose-500 text-white',
  },
  SECURITY: {
    label: 'Keamanan & Akun',
    icon: Shield,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    badge: 'bg-emerald-500 text-white',
  },
};

export default function LogsViewer({ initialLogs }: LogsViewerProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'TRAFFIC' | 'ACTION' | 'ENGAGEMENT' | 'SECURITY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const matchesTab = activeTab === 'ALL' || log.type === activeTab;
      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        (log.description && log.description.toLowerCase().includes(query)) ||
        (log.user?.name && log.user.name.toLowerCase().includes(query)) ||
        (log.guestName && log.guestName.toLowerCase().includes(query)) ||
        (log.path && log.path.toLowerCase().includes(query))
      );
    });
  }, [initialLogs, activeTab, searchQuery]);

  const handleClearAll = () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat log aktivitas?')) {
      startTransition(async () => {
        await clearAllLogsAction();
      });
    }
  };

  const handleDeleteSingle = (id: string) => {
    startTransition(async () => {
      await deleteLogAction(id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Semua ({initialLogs.length})
          </button>

          {(Object.keys(TYPE_CONFIG) as (keyof typeof TYPE_CONFIG)[]).map((type) => {
            const Config = TYPE_CONFIG[type];
            const count = initialLogs.filter((l) => l.type === type).length;
            const Icon = Config.icon;
            
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveTab(type)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === type
                    ? `${Config.color} font-extrabold shadow-sm`
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{Config.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Clear Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari log, user, atau path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-zinc-800/80 border border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all text-slate-800 dark:text-zinc-100"
            />
          </div>

          {initialLogs.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isPending}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold whitespace-nowrap border border-red-500/20"
              title="Bersihkan semua log"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Bersihkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Logs Timeline List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
            <Activity className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">Tidak ada data log yang ditemukan</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {searchQuery ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Belum ada aktivitas yang tercatat untuk filter ini.'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const Config = TYPE_CONFIG[log.type] || TYPE_CONFIG.ACTION;
            const Icon = Config.icon;

            return (
              <div
                key={log.id}
                className="bg-white dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${Config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${Config.color}`}>
                        {log.action}
                      </span>
                      {log.path && (
                        <Link
                          href={log.path}
                          target="_blank"
                          className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full"
                        >
                          <span>{log.path}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {log.title}
                    </h4>

                    {log.description && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                        {log.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                      {/* User or Guest Info */}
                      <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-300">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.user?.name || log.guestName || 'System/Guest'}</span>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(log.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleDeleteSingle(log.id)}
                    disabled={isPending}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                    title="Hapus log ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
