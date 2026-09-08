import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import AdminSidebarNav from '@/components/AdminSidebarNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Strict server-side security check: ONLY OWNER role can access dashboard
  if (!session?.user || session.user.role !== 'OWNER') {
    redirect('/');
  }

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-300 min-h-[calc(100vh-4rem)]">
      {/* Container aligned perfectly with Navbar (container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col md:flex-row">
        
        {/* Sidebar - Perfectly aligned under Kadalio brand, sticky below root Navbar */}
        <aside className="w-full md:w-64 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto border-r border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 py-6 pr-6 flex flex-col justify-between backdrop-blur-2xl transition-colors z-40">
          <div className="space-y-6">
            {/* Header Brand */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-blue-500/20">
                  K
                </div>
                <div>
                  <h2 className="text-base font-extrabold bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent leading-none">
                    Kadalio Admin
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block mt-1">
                    Dashboard Panel
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 tracking-wider">
                OWNER
              </span>
            </div>

            {/* Interactive Sidebar Navigation with Accordion Submenus */}
            <AdminSidebarNav />
          </div>

          {/* Footer Sidebar */}
          <div className="pt-6 border-t border-slate-200 dark:border-zinc-800/80 mt-8 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="flex-1 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900/50 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Blog</span>
            </Link>
            <ThemeToggle />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 py-6 md:py-10 md:pl-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
