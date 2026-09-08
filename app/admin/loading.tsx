export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header shimmer */}
      <div className="space-y-2">
        <div className="h-7 w-56 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-3 w-80 bg-slate-200/70 dark:bg-zinc-800/70 rounded-lg" />
      </div>

      {/* Stats cards shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded-full" />
              <div className="w-10 h-10 rounded-2xl bg-slate-200/80 dark:bg-zinc-800/80" />
            </div>
            <div className="h-9 w-16 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Table shimmer */}
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-3 w-3 bg-slate-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-3 flex-1 bg-slate-200/80 dark:bg-zinc-800/80 rounded-full" />
            <div className="h-3 w-20 bg-slate-200/60 dark:bg-zinc-800/60 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
