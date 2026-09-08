import { Mail, MessageCircle, MapPin, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hubungi Kami (Contact Publisher)',
  description: 'Hubungi pengelola situs Kadalio untuk pertanyaan bisnis, kerja sama, pelaporan kendala teknis, atau penolakan iklan AdSense.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-16 md:py-24 animate-fade-in transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-xs">
            <Mail className="w-4 h-4" />
            <span>Komunikasi & Kemitraan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Hubungi <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Pengelola</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
            Punya pertanyaan seputar artikel, tawaran kerja sama, atau ingin melaporan kendala pada platform? Kami senang mendengarnya dari Anda.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Email Card */}
          <div className="bg-white dark:bg-zinc-900/70 p-6 sm:p-7 rounded-[28px] border border-slate-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Email Resmi</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Cara terbaik untuk komunikasi bisnis, peninjauan hak cipta, dan urusan administratif.
              </p>
            </div>
            <a
              href="mailto:kadalio@example.com"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>kadalio@example.com</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Social Media Card */}
          <div className="bg-white dark:bg-zinc-900/70 p-6 sm:p-7 rounded-[28px] border border-slate-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Media Sosial</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Temukan dan ikuti aktivitas, obrolan seputar teknologi, serta karya terbaru kami di:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <a
                href="https://instagram.com/Kadalio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <span>Instagram</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://threads.net/@Kadalio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-colors"
              >
                <span>Threads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com/Kadalio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>Facebook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com/@Kadalio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <span>YouTube</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-zinc-900/70 p-6 sm:p-7 rounded-[28px] border border-slate-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Profil & Eksplorasi</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Lihat perjalanan karier, sorotan dokumentasi, dan galeri karya selengkapnya.
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>Kunjungi Halaman Tentang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* AdSense Info Alert */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-slate-100 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Platform ini mematuhi standar privasi internasional. Untuk informasi terkait penayangan iklan Google AdSense dan cara mengelola *cookies* Anda, silakan baca <Link href="/privacy" className="text-blue-600 dark:text-blue-400 font-bold underline">Kebijakan Privasi</Link> & <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 font-bold underline">Ketentuan Layanan</Link> kami.
          </p>
        </div>

        {/* Footer Action */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-sm shadow-sm transition-all"
          >
            <span>&larr; Kembali ke Beranda</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
