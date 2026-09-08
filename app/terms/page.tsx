import { FileCheck, AlertCircle, MessageSquare, Scale, Copyright } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ketentuan Layanan & Disclaimer (Terms of Service)',
  description: 'Ketentuan penggunaan situs, hak cipta artikel, aturan berkomentar, dan penolakan pertanggungjawaban di Kadalio.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-16 md:py-24 animate-fade-in transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-xs">
            <Scale className="w-4 h-4" />
            <span>Aturan & Kesepakatan Pembaca</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Ketentuan <span className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">Layanan</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-zinc-900/70 backdrop-blur-xl p-8 sm:p-12 rounded-[32px] border border-slate-200/80 dark:border-zinc-800/80 shadow-sm space-y-10 text-slate-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1: Penerimaan Ketentuan */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>1. Penerimaan Ketentuan</span>
            </h2>
            <p>
              Dengan mengakses dan menggunakan platform <strong>Kadalio</strong>, Anda setuju untuk terikat oleh Ketentuan Layanan (*Terms of Service*) ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda dipersilakan untuk tidak melanjutkan penggunaan situs atau layanan interaktif kami.
            </p>
          </section>

          {/* Section 2: Hak Cipta & Kekayaan Intelektual */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
              <Copyright className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>2. Hak Cipta & Penggunaan Konten</span>
            </h2>
            <p>
              Seluruh artikel, tutorial, kode sumber (*source code*), foto galeri, dan desain visual yang dipublikasikan di situs ini adalah milik intelektual pengelola <strong>Kadalio</strong>, kecuali disebutkan sebaliknya (misalnya perpustakaan pihak ketiga atau kutipan publik).
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>Diperbolehkan:</strong> Anda diizinkan membaca, menyalin potongan kode (*code snippets*) untuk proyek pribadi/komersial Anda, serta membagikan tautan (*link*) artikel ke media sosial dengan mencantumkan sumber.</li>
              <li><strong>Dilarang:</strong> Anda tidak diperkenankan menyalin ulang seluruh isi artikel (*scraping/re-posting*) di blog atau situs lain tanpa izin tertulis dari penulis.</li>
            </ul>
          </section>

          {/* Section 3: Aturan Berkomentar & Konten Pengguna */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>3. Aturan Berkomentar & Interaksi Pengguna</span>
            </h2>
            <p>
              Kami menyediakan fasilitas kolom komentar dan galeri interaktif agar pembaca dapat berdiskusi. Demi menjaga iklim diskusi yang sehat dan memenuhi standar kebijakan Google, setiap pengguna wajib mematuhi aturan berikut:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Dilarang menulis komentar yang mengandung ujaran kebencian (*hate speech*), pelecehan, rasisme, atau kekerasan.</li>
              <li>Dilarang membagikan tautan *spam*, promosi ilegal, perjudian (*judol*), atau perangkat lunak berbahaya (*malware*).</li>
              <li>Pengelola berhak penuh untuk menghapus, menyunting, atau memblokir komentar dan akun pengguna yang melanggar ketentuan tanpa pemberitahuan sebelumnya.</li>
            </ul>
          </section>

          {/* Section 4: Penolakan Pertanggungjawaban (Disclaimer) */}
          <section className="space-y-3 bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>4. Penolakan Pertanggungjawaban (*Disclaimer*)</span>
            </h2>
            <p>
              Semua tutorial teknis dan informasi pemrograman yang disediakan di situs ini bertujuan untuk edukasi dan dokumentasi. Kami berusaha semaksimal mungkin memberikan informasi yang akurat dan teruji, namun:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Kami tidak menjamin bahwa semua kode atau panduan akan 100% cocok dengan lingkungan sistem (*environment*) atau versi perangkat lunak Anda di masa depan.</li>
              <li>Pengelola tidak bertanggung jawab atas kerugian langsung maupun tidak langsung (termasuk kehilangan data atau kerusakan server) yang timbul akibat penerapan tutorial dari situs ini. Lakukan *backup* dan uji coba di lingkungan *development* sebelum menerapkan ke sistem *production*.</li>
            </ul>
          </section>

          {/* Section 5: Perubahan Ketentuan */}
          <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
              5. Perubahan Ketentuan & Hukum yang Berlaku
            </h2>
            <p>
              Kami dapat memperbarui Ketentuan Layanan ini sewaktu-waktu sesuai perkembangan hukum dan fitur platform. Ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia. Jika Anda memiliki pertanyaan seputar ketentuan ini, silakan hubungi kami melalui halaman <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Hubungi Kami</Link>.
            </p>
          </section>

        </div>

        {/* Footer Action */}
        <div className="text-center flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 font-bold text-sm shadow-xs transition-all"
          >
            <span>Baca Kebijakan Privasi</span>
          </Link>
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
