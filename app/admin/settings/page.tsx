'use client';

import { useState, useEffect } from 'react';
import { Settings, Globe, BarChart3, DollarSign, Check, Loader2, Sparkles, ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface SiteSetting {
  id: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  googleAnalyticsId: string | null;
  googleAdsenseId: string | null;
  adsenseAutoAds: boolean;
  updatedAt?: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSetting>({
    id: 'global',
    siteTitle: 'Kadalio — Catatan & Dokumentasi Web',
    siteDescription: 'Catatan pemikiran, dokumentasi teknis pengembangan web, dan galeri eksplorasi visual.',
    siteKeywords: 'web development, nextjs 16, tailwind css, galeri visual, teknologi, programming indonesia, dokumentasi teknis',
    googleAnalyticsId: '',
    googleAdsenseId: '',
    adsenseAutoAds: true
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          id: data.id || 'global',
          siteTitle: data.siteTitle || '',
          siteDescription: data.siteDescription || '',
          siteKeywords: data.siteKeywords || '',
          googleAnalyticsId: data.googleAnalyticsId || '',
          googleAdsenseId: data.googleAdsenseId || '',
          adsenseAutoAds: data.adsenseAutoAds !== undefined ? data.adsenseAutoAds : true
        });
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setMessage({ text: 'Pengaturan SEO, Google Analytics, dan AdSense berhasil disimpan ke database!', type: 'success' });
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Pengaturan berhasil diperbarui & diterapkan seketika!', type: 'success' }
        }));
      } else {
        const err = await res.json();
        setMessage({ text: err.error || 'Gagal menyimpan pengaturan', type: 'error' });
      }
    } catch (e) {
      console.error('Error saving settings:', e);
      setMessage({ text: 'Terjadi kesalahan jaringan saat menyimpan', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Memuat konfigurasi global...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pengaturan Global, SEO & Monetisasi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Kelola judul situs, deskripsi meta, kata kunci SEO, serta integrasi ID Google Analytics (GA4) & AdSense secara dinamis tanpa perlu edit kode sumber.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold animate-scale-in ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          {message.type === 'success' ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Global SEO & Metadata Configuration */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 sm:p-8 rounded-[28px] border border-slate-200/80 dark:border-zinc-800/80 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                Identitas Website & Optimasi Mesin Pencari (SEO)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Informasi ini akan digunakan pada tag `&lt;title&gt;`, meta deskripsi Google, dan pratinjau sosial media (OpenGraph).
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                Judul Utama Website (`siteTitle`)
              </label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                placeholder="Contoh: Kadalio — Catatan & Dokumentasi Web"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100"
                required
              />
              <span className="block mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                Muncul di tab browser pada halaman utama dan sebagai awalan standar judul artikel.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                Deskripsi Singkat / Meta Description (`siteDescription`)
              </label>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                placeholder="Deskripsikan fokus website atau portofolio Anda dalam 1-2 kalimat..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100"
                required
              />
              <span className="block mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                Disarankan maksimal 160 karakter agar tampil penuh pada hasil pencarian Google (SERP).
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                Kata Kunci SEO (`siteKeywords`)
              </label>
              <input
                type="text"
                value={settings.siteKeywords}
                onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })}
                placeholder="web development, nextjs 16, tailwind css, galeri visual, teknologi indonesia..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100"
              />
              <span className="block mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                Pisahkan dengan tanda koma. Membantu robot pencari mengelompokkan topik website Anda.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Google Analytics (GA4) Configuration */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 sm:p-8 rounded-[28px] border border-slate-200/80 dark:border-zinc-800/80 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Google Analytics 4 (GA4) Tracking
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Lacak jumlah kunjungan, durasi baca artikel, dan demografi pengunjung website Anda.
                </p>
              </div>
            </div>
            {settings.googleAnalyticsId ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AKTIF ({settings.googleAnalyticsId})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                BELUM DIATUR
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                GA4 Measurement ID (`G-XXXXXXXXXX`)
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="Contoh: G-1A2B3C4D5E"
                className="w-full sm:max-w-md px-4 py-3 rounded-2xl font-mono bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100"
              />
              <span className="block mt-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                Dapatkan ID ini dari dasbor <strong>analytics.google.com</strong> &rarr; Admin &rarr; Data Streams &rarr; Web. Jika kosong, sistem otomatis memakai fallback `NEXT_PUBLIC_GA_ID` dari `.env`.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Google AdSense & Monetization Configuration */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 sm:p-8 rounded-[28px] border border-slate-200/80 dark:border-zinc-800/80 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Google AdSense Monetization
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Tampilkan iklan bermartabat pada artikel untuk memperoleh pendapatan pasif dari konten Anda.
                </p>
              </div>
            </div>
            {settings.googleAdsenseId ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                AKTIF ({settings.googleAdsenseId})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                BELUM DIATUR
              </span>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                Google AdSense Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`)
              </label>
              <input
                type="text"
                value={settings.googleAdsenseId || ''}
                onChange={(e) => setSettings({ ...settings, googleAdsenseId: e.target.value })}
                placeholder="Contoh: ca-pub-1234567890123456"
                className="w-full sm:max-w-md px-4 py-3 rounded-2xl font-mono bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100"
              />
              <span className="block mt-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                ID penayang akun AdSense Anda. Setelah diisi, skrip verifikasi AdSense akan disematkan otomatis pada seluruh halaman.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 flex items-start gap-3.5">
              <input
                type="checkbox"
                id="autoAds"
                checked={settings.adsenseAutoAds}
                onChange={(e) => setSettings({ ...settings, adsenseAutoAds: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-zinc-600 cursor-pointer"
              />
              <label htmlFor="autoAds" className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                <span className="font-bold block text-slate-900 dark:text-zinc-100 mb-0.5">Aktifkan Iklan Otomatis (Auto Ads) &amp; Penempatan Dalam Artikel</span>
                Saat diaktifkan, iklan akan menyesuaikan diri secara cerdas tanpa merusak estetika membaca artikel. Mode pengembangan (Dev Server) tetap menonaktifkan iklan secara visual untuk melindungi akun Anda dari klik salah/pribadi.
              </label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Simpan Semua Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
