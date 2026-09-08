'use client';

import { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  AlertCircle, 
  Loader2, 
  Link as LinkIcon, 
  Sparkles,
  Database,
  HardDrive,
  Edit3,
  Save
} from 'lucide-react';
import { deleteMedia, logMediaUpload, updateMediaCaption } from '@/lib/actions/media.actions';
import { useRouter } from 'next/navigation';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  publicId: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  postId: string | null;
  storyId: string | null;
  postTitle?: string | null;
  caption?: string | null;
}

interface AdminMediaManagerProps {
  mediaList: MediaItem[];
  totalSizeBytes: number;
}

export default function AdminMediaManager({ mediaList, totalSizeBytes }: AdminMediaManagerProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'STANDALONE'>('ALL');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [savingCaptionId, setSavingCaptionId] = useState<string | null>(null);

  const handleStartEditCaption = (id: string, currentCaption: string | null | undefined) => {
    setEditingCaptionId(id);
    setCaptionText(currentCaption || '');
  };

  const handleSaveCaption = async (id: string) => {
    setSavingCaptionId(id);
    try {
      const res = await updateMediaCaption(id, captionText);
      if (res.success) {
        setEditingCaptionId(null);
        router.refresh();
      } else {
        alert(res.error || 'Gagal menyimpan caption');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCaptionId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 50 * 1024 * 1024) {
          setUploadError(`File "${file.name}" melebihi batas maksimal 50MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          setUploadError(data.error || `Gagal mengunggah "${file.name}".`);
        } else {
          // Log upload action
          await logMediaUpload(
            data.mediaId,
            file.name,
            file.type.startsWith('video') ? 'VIDEO' : 'IMAGE',
            file.size
          );
        }
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setUploadError('Terjadi kesalahan koneksi saat mengunggah.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus media "${name}" secara permanen?`)) return;

    setDeletingId(id);
    try {
      const res = await deleteMedia(id);
      if (!res.success) {
        alert(res.error || 'Gagal menghapus media.');
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (url: string, id: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.publicId.toLowerCase().includes(search.toLowerCase()) || 
                          item.url.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'IMAGE') return item.type === 'IMAGE' && !item.url.match(/\.(mp4|webm|mov)$/i);
    if (filter === 'VIDEO') return item.type === 'VIDEO' || item.url.match(/\.(mp4|webm|mov)$/i);
    if (filter === 'STANDALONE') return !item.postId && !item.storyId;
    return true;
  });

  const imageCount = mediaList.filter(m => m.type === 'IMAGE' || !m.url.match(/\.(mp4|webm|mov)$/i)).length;
  const videoCount = mediaList.length - imageCount;
  const standaloneCount = mediaList.filter(m => !m.postId && !m.storyId).length;
  const totalMB = (totalSizeBytes / 1024 / 1024).toFixed(2);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Total Foto</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">{imageCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Total Video</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">{videoCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Standalone (Galeri)</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">{standaloneCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Penyimpanan</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">{totalMB} <span className="text-xs font-medium">MB</span></h3>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10 p-6 sm:p-8 rounded-3xl border-2 border-dashed border-blue-500/30 dark:border-blue-500/40 text-center relative overflow-hidden transition-all hover:border-blue-500/60">
        <input
          type="file"
          id="media-upload-input"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        <div className="max-w-md mx-auto space-y-3 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            {isUploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Upload className="w-7 h-7" />}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
            {isUploading ? 'Sedang Mengunggah & Memproses...' : 'Klik atau Drag & Drop untuk Unggah ke Galeri'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Mendukung JPG, PNG, WEBP, GIF, MP4, WEBM, MOV (Maksimal 50MB per file). Media akan otomatis tampil di halaman Galeri Visual.
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-2.5 font-medium animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-center">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            Semua ({mediaList.length})
          </button>
          <button
            onClick={() => setFilter('IMAGE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'IMAGE' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto ({imageCount})</span>
          </button>
          <button
            onClick={() => setFilter('VIDEO')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'VIDEO' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video ({videoCount})</span>
          </button>
          <button
            onClick={() => setFilter('STANDALONE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'STANDALONE' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Galeri Mandiri ({standaloneCount})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau ID file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.map((item) => {
          const isVid = item.type === 'VIDEO' || item.url.match(/\.(mp4|webm|mov)$/i);
          const sizeMB = (item.sizeBytes / 1024 / 1024).toFixed(2);
          const isStandalone = !item.postId && !item.storyId;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              {/* Media Preview Thumbnail */}
              <div className="relative aspect-square bg-slate-950 overflow-hidden">
                {isVid ? (
                  <video src={item.url} className="w-full h-full object-cover" muted loop playsInline />
                ) : (
                  <img src={item.url} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase text-white shadow-sm flex items-center gap-1 ${
                    isVid ? 'bg-purple-600/90' : 'bg-blue-600/90'
                  }`}>
                    {isVid ? <Video className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                    <span>{isVid ? 'Video' : 'Foto'}</span>
                  </span>

                  {isStandalone ? (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-600/90 text-white shadow-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Galeri</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-zinc-800/90 text-zinc-300 shadow-sm truncate max-w-[100px]" title={item.postTitle || 'Linked'}>
                      {item.postId ? `Post: ${item.postTitle || 'Artikel'}` : 'Story'}
                    </span>
                  )}
                </div>

                {/* Size Badge */}
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold backdrop-blur-sm">
                  {sizeMB} MB
                </span>
              </div>

              {/* Info & Actions */}
              <div className="p-3 space-y-2 bg-slate-50/50 dark:bg-zinc-950/50 border-t border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200 truncate" title={item.publicId}>
                    {item.publicId}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 shrink-0">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>

                {/* Caption Display / Editor */}
                {editingCaptionId === item.id ? (
                  <div className="space-y-1.5 py-1 border-y border-blue-500/20 bg-blue-500/5 p-1.5 rounded-xl">
                    <textarea
                      rows={2}
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      placeholder="Tulis caption foto/video..."
                      className="w-full text-[11px] p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-blue-500 text-slate-800 dark:text-zinc-200 focus:outline-none resize-none"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingCaptionId(null)}
                        className="px-2 py-1 text-[10px] rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-300 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCaption(item.id)}
                        disabled={savingCaptionId === item.id}
                        className="px-2 py-1 text-[10px] rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {savingCaptionId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        <span>Simpan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-1 flex items-start justify-between gap-2 group/caption border-t border-slate-100 dark:border-zinc-800/60">
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 italic line-clamp-2 flex-1">
                      {item.caption ? `"${item.caption}"` : <span className="text-slate-400 dark:text-zinc-600 font-normal">+ Tambah caption...</span>}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleStartEditCaption(item.id, item.caption)}
                      className="p-1 rounded text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors shrink-0 cursor-pointer"
                      title="Edit Caption"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url, item.id)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Salin URL file"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin URL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.publicId)}
                    disabled={deletingId === item.id}
                    className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    title="Hapus Media"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/20 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
          <ImageIcon className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-zinc-300 mb-1">Media Tidak Ditemukan</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mx-auto">
            Belum ada foto atau video yang cocok dengan filter atau pencarian Anda.
          </p>
        </div>
      )}

    </div>
  );
}
