import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 pt-12 pb-8 mt-auto transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-8">
        
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 text-center md:text-left">
          
          {/* Brand & Description */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">Kadalio</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                © {new Date().getFullYear()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Catatan pemikiran, dokumentasi teknis pengembangan web, dan galeri eksplorasi visual.
            </p>
          </div>

          {/* Social Media Links (Instagram, Threads, Facebook, YouTube) */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Temukan di Media Sosial
            </span>
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://instagram.com/Kadalio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Kadalio"
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white transition-all shadow-xs scale-100 hover:scale-110"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Threads */}
              <a
                href="https://threads.net/@Kadalio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Threads Kadalio"
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all shadow-xs scale-100 hover:scale-110"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.186 24c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.484 0 6.621 1.487 8.818 3.869l-2.613 2.502c-1.637-1.782-3.87-2.871-6.205-2.871-4.962 0-9 4.038-9 9s4.038 9 9 9c4.27 0 7.854-2.986 8.784-7.014h-8.784v-3.5h12.287c.07.58.113 1.176.113 1.786 0 6.627-5.373 12-12.4 12z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/Kadalio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Kadalio"
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-blue-600 hover:text-white transition-all shadow-xs scale-100 hover:scale-110"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@Kadalio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Kadalio"
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-red-600 hover:text-white transition-all shadow-xs scale-100 hover:scale-110"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Legal Navigation Bar */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-center text-xs">
          <nav className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 font-medium">
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-zinc-100 transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-zinc-100 transition-colors">Ketentuan Layanan</Link>
            <Link href="/contact" className="hover:text-blue-600 dark:hover:text-zinc-100 transition-colors">Hubungi Kami</Link>
            <Link href="/about" className="hover:text-blue-600 dark:hover:text-zinc-100 transition-colors">Tentang Penulis</Link>
            <Link href="/rss" className="hover:text-blue-600 dark:hover:text-zinc-100 transition-colors">RSS Feed</Link>
          </nav>
        </div>

      </div>
    </footer>
  );
}
