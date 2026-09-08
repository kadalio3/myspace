import { Suspense } from 'react';

function ErrorContent({ error }: { error?: string }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-red-500">
        Authentication Error
      </h1>
      <p className="text-sm text-zinc-400">
        {error === 'Configuration' ? 'Terdapat kesalahan pada konfigurasi server.' :
         error === 'AccessDenied' ? 'Akses ditolak.' :
         'Terjadi kesalahan yang tidak terduga saat mencoba login.'}
      </p>
    </div>
  );
}

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <Suspense fallback={<div className="text-center text-zinc-500">Loading...</div>}>
          <ErrorContent error={resolvedSearchParams?.error} />
        </Suspense>
        
        <div className="flex justify-center mt-6">
          <a
            href="/login"
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium text-sm"
          >
            Kembali ke Halaman Login
          </a>
        </div>
      </div>
    </div>
  );
}
