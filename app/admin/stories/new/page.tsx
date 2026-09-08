'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Upload, Type, Image as ImageIcon, Sparkles } from 'lucide-react';
import { createStory } from '@/lib/actions/story.actions';

const BG_PRESETS = [
  { id: 'sunset', name: 'Sunset 🔥', gradient: 'bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500' },
  { id: 'neon', name: 'Cyber Neon ⚡', gradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700' },
  { id: 'ocean', name: 'Ocean Breeze 🌊', gradient: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700' },
  { id: 'gold', name: 'Golden Hour 🌅', gradient: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600' },
  { id: 'rose', name: 'Passionate Rose 🌹', gradient: 'bg-gradient-to-br from-rose-600 via-red-600 to-pink-700' },
  { id: 'dark', name: 'Sleek Dark 🖤', gradient: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-black border border-zinc-700' },
];

export default function NewStoryPage() {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [caption, setCaption] = useState('');
  const [bgStyle, setBgStyle] = useState('sunset');
  
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setMediaUrl(data.url);
      setMediaId(data.mediaId);
    } catch (err) {
      alert('Failed to upload image');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const currentPreset = BG_PRESETS.find(p => p.id === bgStyle) || BG_PRESETS[0];

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 flex items-center gap-2 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            <span>Create Story</span>
            <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
              Instagram Style
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Post update singkat 24 jam dengan teks atau gambar</p>
        </div>
        <Link 
          href="/admin"
          className="px-4 py-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-all shadow-sm"
        >
          Cancel
        </Link>
      </div>

      {/* Mode Switcher */}
      <div className="flex p-1.5 bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-2xl mb-8 max-w-md mx-auto shadow-sm">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'text'
              ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>✨ Teks / Instagram Create</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('image')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'image'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>📷 Foto / Gambar</span>
        </button>
      </div>

      <form action={createStory} className="space-y-8">
        <input type="hidden" name="bgStyle" value={bgStyle} />
        <input type="hidden" name="mediaId" value={mode === 'image' ? (mediaId || '') : ''} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Controls Left Side */}
          <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm dark:shadow-xl transition-all">
            {mode === 'text' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                    Tulis Pesan Story Anda
                  </label>
                  <textarea
                    name="caption"
                    rows={4}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Apa yang sedang Anda pikirkan? (Teks akan tampil besar di tengah layar)..."
                    required={mode === 'text'}
                    className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl p-4 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 resize-none shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3">
                    Pilih Tema Warna Background
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {BG_PRESETS.map((preset: any) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setBgStyle(preset.id)}
                        className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between ${preset.gradient} ${
                          bgStyle === preset.id
                            ? 'ring-2 ring-slate-900 dark:ring-white scale-[1.02] shadow-xl'
                            : 'opacity-70 hover:opacity-100 border-transparent'
                        }`}
                      >
                        <span className="text-white drop-shadow-md">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-4">Upload Foto Story</label>
                  
                  {mediaUrl ? (
                    <div className="relative aspect-[9/16] max-w-[220px] mx-auto bg-black rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl">
                      <img src={mediaUrl} alt="Preview" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => { setMediaUrl(null); setMediaId(null); }}
                        className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors backdrop-blur-md"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[9/16] max-w-[220px] mx-auto border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-all text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 p-4 text-center bg-slate-50/50 dark:bg-transparent"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold">{isUploading ? 'Uploading...' : 'Klik untuk Upload (Rasio 9:16)'}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Caption Tambahan (Opsional)</label>
                  <input
                    type="text"
                    name="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tulis caption kecil di bawah foto..."
                    className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-inner"
                  />
                </div>
              </>
            )}
          </div>

          {/* Live Phone Preview Right Side */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>Live Story Preview</span>
            </span>

            <div className="w-[260px] h-[480px] rounded-[36px] p-2 bg-slate-900 dark:bg-zinc-950 border-4 border-slate-300 dark:border-zinc-800 shadow-2xl relative flex flex-col overflow-hidden">
              {/* Phone Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 dark:bg-zinc-900 rounded-full z-30" />

              {/* Story Content */}
              <div className={`w-full h-full rounded-[28px] overflow-hidden relative flex items-center justify-center ${
                mode === 'text' ? currentPreset.gradient : 'bg-zinc-900'
              }`}>
                {/* User Header */}
                <div className="absolute top-6 left-0 right-0 z-20 px-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px] font-bold text-white">
                    K
                  </div>
                  <span className="text-white text-xs font-semibold drop-shadow">Kadalio</span>
                  <span className="text-white/70 text-[10px] ml-auto drop-shadow">Baru saja</span>
                </div>

                {mode === 'text' ? (
                  <div className="px-6 text-center z-10 w-full">
                    <p className="text-lg md:text-xl font-extrabold text-white drop-shadow-lg leading-snug break-words">
                      {caption || 'Ketik sesuatu untuk melihat preview story Anda di sini...'}
                    </p>
                  </div>
                ) : (
                  <>
                    {mediaUrl ? (
                      <img src={mediaUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4 text-zinc-500 text-xs font-medium">
                        Belum ada foto diupload
                      </div>
                    )}
                    {caption && (
                      <div className="absolute bottom-6 left-0 right-0 z-20 px-4 text-center">
                        <span className="inline-block bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs shadow-lg max-w-full truncate">
                          {caption}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="submit"
            disabled={(mode === 'image' && !mediaId) || (mode === 'text' && !caption.trim()) || isUploading}
            className="px-8 py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-500/20 hover:scale-[1.02] cursor-pointer text-sm"
          >
            🚀 Post ke Story Sekarang (24 Jam)
          </button>
        </div>
      </form>
    </div>
  );
}
