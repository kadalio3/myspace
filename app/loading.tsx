export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 dark:bg-zinc-950 transition-colors">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        {/* Logo shimmer */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-purple-500/20 border border-blue-500/10 flex items-center justify-center">
          <div className="w-6 h-6 rounded-lg bg-blue-500/30" />
        </div>

        {/* Text shimmer */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="h-3 w-32 bg-slate-200 dark:bg-zinc-800 rounded-full" />
          <div className="h-2 w-20 bg-slate-200/70 dark:bg-zinc-800/70 rounded-full" />
        </div>

        {/* Spinner */}
        <div className="mt-2 w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}
