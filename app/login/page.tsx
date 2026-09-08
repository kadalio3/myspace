import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams?.error === 'Configuration' ? 
    'Ada masalah pada konfigurasi server.' :
    resolvedSearchParams?.error === 'AccessDenied' ?
    'Akses ditolak. Hanya Owner yang dapat masuk.' :
    resolvedSearchParams?.error ? 'Email atau password salah.' : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Theme Toggle Button in Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 transition-all">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 border border-white/10">
              <span className="text-white font-extrabold text-2xl leading-none">K</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
              Owner Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Masuk menggunakan kredensial pemilik blog pribadi.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm text-center font-medium animate-shake">
              {errorMessage}
            </div>
          )}

          <form
            action={async (formData) => {
              'use server';
              try {
                await signIn('credentials', Object.fromEntries(formData));
              } catch (error) {
                if (error instanceof AuthError) {
                  // Redirect to show friendly error message instead of crashing with 500 error
                  return redirect('/login?error=CredentialsSignin');
                }
                // Re-throw non-AuthErrors (IMPORTANT: Next.js redirect() throws a NEXT_REDIRECT error on success which must be re-thrown!)
                throw error;
              }
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5 ml-1">
                Email Address
              </label>
              <input 
                id="email"
                type="email" 
                name="email" 
                placeholder="admin@example.com" 
                required 
                defaultValue="admin@example.com"
                className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm shadow-inner"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5 ml-1">
                Password
              </label>
              <input 
                id="password"
                type="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                defaultValue="owner123"
                className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm shadow-inner"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl py-3.5 text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer mt-2"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800/80 text-center">
            <Link 
              href="/" 
              className="text-xs text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300 transition-colors font-medium"
            >
              &larr; Kembali ke Beranda Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
