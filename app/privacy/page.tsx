import { ShieldCheck, Lock, Eye, Cookie, FileText } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi & Ketentuan Layanan (Privacy Policy)',
  description: 'Dokumen resmi mengenai pengelolaan data pribadi, penggunaan cookie, analitik Google, dan penayangan iklan di situs Kadalio.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-16 md:py-24 animate-fade-in transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Kepatuhan & Keamanan Data Pembaca</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Kebijakan <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Privasi</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-zinc-900/70 backdrop-blur-xl p-8 sm:p-12 rounded-[32px] border border-slate-200/80 dark:border-zinc-800/80 shadow-sm space-y-10 text-slate-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1: Pengantar */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>1. Pengantar & Komitmen Privasi</span>
            </h2>
            <p>
              Selamat datang di <strong>Kadalio</strong> (atau &quot;kami&quot;). Kami sangat menghargai dan melindungi privasi setiap pengunjung dan pembaca situs ini. Kebijakan Privasi ini menjelaskan bagaimana informasi pribadi Anda dikumpulkan, digunakan, dilindungi, dan dibagikan saat Anda mengunjungi, membaca artikel, atau berinteraksi di platform kami.
            </p>
          </section>

          {/* Section 2: Data yang Dikumpulkan */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>2. Informasi yang Kami Kumpulkan</span>
            </h2>
            <p>Kami mengumpulkan dua jenis informasi dari pengguna:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>Data Interaksi Autentikasi:</strong> Jika Anda mendaftar atau masuk menggunakan akun Google atau GitHub melalui Auth.js, kami hanya menyimpan alamat email, nama pengguna, dan foto profil (*avatar*) Anda demi keperluan otentikasi komentar dan *like*.</li>
              <li><strong>Data Tamu / Guest:</strong> Jika Anda berkomentar sebagai tamu (*Guest*), kami menyimpan nama tampilan yang Anda masukkan dan token sementara di *cookie* peramban agar Anda dapat berinteraksi tanpa akun.</li>
              <li><strong>Log Kunjungan Otomatis (*Traffic Logs*):</strong> Sistem kami mencatat jejak kunjungan dasar (halaman yang dibaca, cap waktu, dan jenis peramban) untuk keperluan analitik performa artikel dan pencegahan penyalahgunaan sistem (*anti-DDoS*).</li>
            </ul>
          </section>

          {/* Section 3: Google Analytics */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>3. Penggunaan Google Analytics (GA4)</span>
            </h2>
            <p>
              Situs ini menggunakan <strong>Google Analytics</strong>, layanan analisis web yang disediakan oleh Google LLC (&quot;Google&quot;). Google Analytics menggunakan *cookies* untuk membantu kami menganalisis bagaimana pengunjung menggunakan situs ini (seperti durasi kunjungan, halaman paling populer, dan asal rujukan trafik).
            </p>
            <p>
              Informasi yang dihasilkan oleh cookie mengenai penggunaan Anda atas situs ini akan dikirimkan ke dan disimpan oleh server Google. Anda dapat menonaktifkan pengumpulan data oleh Google Analytics dengan memasang pengaya peramban <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">Google Analytics Opt-out Browser Add-on</a>.
            </p>
          </section>

          {/* Section 4: Google AdSense & DART Cookies */}
          <section className="space-y-3 bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
              <Cookie className="w-5 h-5 text-amber-500 shrink-0" />
              <span>4. Google AdSense & Cookie DART DoubleClick</span>
            </h2>
            <p>
              Kami bermitra dengan <strong>Google AdSense</strong> untuk menayangkan iklan yang relevan kepada pembaca guna mendukung biaya operasional dan pemeliharaan server platform ini.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Google, sebagai vendor pihak ketiga, menggunakan *cookies* (termasuk <strong>Cookie DART</strong>) untuk melayani iklan di situs kami berdasarkan kunjungan pengguna ke situs ini dan situs web lain di internet.</li>
              <li>Pengguna dapat menyetujui atau menolak penggunaan cookie DART untuk penayangan iklan berbasis minat dengan mengunjungi halaman <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">Pengaturan Iklan Google (Google Ads Settings)</a>.</li>
              <li>Vendor iklan pihak ketiga lainnya juga dapat menggunakan *cookies* atau suar web (*web beacons*) untuk mengukur efektivitas iklan mereka atau mempersonalisasi konten iklan.</li>
            </ul>
          </section>

          {/* Section 5: Hubungi Kami */}
          <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
              5. Hubungi Pengelola
            </h2>
            <p>
              Jika Anda memiliki pertanyaan lebih lanjut mengenai Kebijakan Privasi ini atau pengelolaan data di situs Kadalio, Anda dapat menghubungi kami melalui halaman <Link href="/about" className="text-blue-600 dark:text-blue-400 underline font-semibold">Tentang Penulis</Link> atau mengirimkan email langsung ke pengelola platform.
            </p>
          </section>

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
