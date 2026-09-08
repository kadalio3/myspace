'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Send,
  MoreHorizontal,
  Video,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { showToast } from '@/components/ToastProvider';
import { toggleMediaLike, addMediaComment } from '@/lib/actions/media.actions';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  createdAt: string;
  caption?: string | null;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  commentsList?: Array<{
    id: string;
    name: string;
    avatar: string | null;
    text: string;
    time: string;
  }>;
}

interface OwnerData {
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

interface InstagramGalleryModalProps {
  media: MediaItem[];
  initialIndex: number;
  owner: OwnerData;
  onClose: () => void;
}

interface GalleryCommentItem {
  id: string;
  name: string;
  avatar: string;
  text: string;
  time: string;
}

function renderCaptionWithHashtags(text?: string | null) {
  if (!text || text.trim() === '') {
    return <span className="text-slate-400 dark:text-zinc-500 italic font-normal">Belum ada keterangan untuk media ini.</span>;
  }
  
  const tokens = text.split(/(\s+)/);
  return tokens.map((token, idx) => {
    if (token.startsWith('#') && token.length > 1) {
      return (
        <span key={idx} className="text-blue-500 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
          {token}
        </span>
      );
    }
    return token;
  });
}

export default function InstagramGalleryModal({
  media,
  initialIndex,
  owner,
  onClose
}: InstagramGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  
  // Comment state per media item
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, GalleryCommentItem[]>>({});
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentMedia = media[currentIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMediaLoaded(false);
  }, [currentIndex]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  }, [currentIndex, media.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(media.length - 1); // Loop to end
    }
  }, [currentIndex, media.length]);

  // Keyboard navigation (Escape to close, Left/Right arrows to navigate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  if (!currentMedia || !mounted) return null;

  const isVideo = currentMedia.type === 'VIDEO' || currentMedia.url.match(/\.(mp4|webm|mov)$/i);
  const mediaId = currentMedia.id;
  const isLiked = liked[mediaId] !== undefined ? liked[mediaId] : (currentMedia.isLiked || false);
  const count = likeCounts[mediaId] !== undefined ? likeCounts[mediaId] : (currentMedia.likesCount || 0);
  const isBookmarked = bookmarked[mediaId] || false;
  const currentComments = commentsMap[mediaId] || currentMedia.commentsList || [];

  const handleLikeToggle = async () => {
    const newLiked = !isLiked;
    setLiked(prev => ({ ...prev, [mediaId]: newLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [mediaId]: newLiked ? count + 1 : Math.max(0, count - 1)
    }));
    if (newLiked) {
      showToast('❤️ Menyukai postingan ini!', 'success');
    }
    await toggleMediaLike(mediaId);
  };

  const handleBookmarkToggle = () => {
    setBookmarked(prev => ({ ...prev, [mediaId]: !isBookmarked }));
    showToast(isBookmarked ? 'Dihapus dari simpanan.' : '📌 Disimpan ke koleksi pribadi!', 'info');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${currentMedia.url}`;
      navigator.clipboard.writeText(fullUrl);
      showToast('🔗 Tautan media berhasil disalin ke clipboard!', 'success');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const content = commentInput.trim();
    setCommentInput('');

    const res = await addMediaComment(mediaId, content);
    if (res.success && res.comment) {
      const newComment: GalleryCommentItem = {
        id: res.comment.id,
        name: res.comment.name,
        avatar: res.comment.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        text: res.comment.content,
        time: 'Baru saja'
      };

      setCommentsMap(prev => ({
        ...prev,
        [mediaId]: [newComment, ...(prev[mediaId] || currentMedia.commentsList || [])]
      }));
      showToast('✨ Komentar Anda berhasil dikirim!', 'success');
    } else {
      showToast(res.error || 'Gagal mengirim komentar', 'error');
    }
  };

  const formattedDate = new Date(currentMedia.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-white/25 dark:bg-black/45 backdrop-blur-[3px] flex items-center justify-center p-0 md:p-6 animate-fade-in">
      {/* Top Right Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 text-slate-700 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 rounded-full shadow-lg transition-all backdrop-blur-md cursor-pointer focus:outline-none border border-slate-200 dark:border-zinc-700"
        title="Tutup Galeri (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Instagram Modal Container */}
      <div className="w-full max-w-6xl h-full md:h-[85vh] bg-white dark:bg-zinc-950 md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200 dark:border-zinc-800 animate-scale-up">
        
        {/* Left Side: Media Display (62% on desktop) */}
        <div className="relative w-full md:w-[62%] h-[45vh] md:h-full bg-black/95 flex items-center justify-center select-none overflow-hidden group">
          
          {/* Ambient Blurred Background Glow (Lightweight GPU-friendly blur) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25 blur-3xl scale-125 transform-gpu transition-opacity duration-500">
            {isVideo ? (
              <video src={currentMedia.url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
            ) : (
              <img src={currentMedia.url} alt="Ambient glow" className="w-full h-full object-cover" />
            )}
          </div>

          {/* Loading Spinner / Skeleton */}
          {!isMediaLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-xs">
              <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin shadow-lg" />
            </div>
          )}

          {/* Main Media Content */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-6">
            {isVideo ? (
              <video
                src={currentMedia.url}
                onLoadedData={() => setIsMediaLoaded(true)}
                className={`w-full h-full object-contain max-h-full rounded-xl shadow-2xl transition-opacity duration-300 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                controls
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                src={currentMedia.url}
                onLoad={() => setIsMediaLoaded(true)}
                alt="Gallery media"
                className={`w-full h-full object-contain max-h-full rounded-xl shadow-2xl transition-all duration-300 group-hover:scale-[1.01] ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </div>

          {/* Navigation Arrows (Left / Right) */}
          {media.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
                title="Sebelumnya (Panah Kiri)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
                title="Selanjutnya (Panah Kanan)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Top Left: Download Full Resolution Button */}
          <div className="absolute top-4 left-4 z-20">
            <a
              href={currentMedia.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 text-xs font-medium shadow-lg hover:scale-105"
              title="Unduh Resolusi Penuh"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Resolusi Penuh</span>
            </a>
          </div>
        </div>

        {/* Right Side: Instagram Sidebar (38% on desktop) */}
        <div className="w-full md:w-[38%] h-[55vh] md:h-full flex flex-col justify-between bg-white dark:bg-zinc-950 border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800/80">
          
          {/* Sidebar Header: Author Info */}
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 shadow-sm">
                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 p-0.5 overflow-hidden">
                  {owner.avatarUrl ? (
                    <img src={owner.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {(owner.name || 'K')[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                    {owner.name || 'Kadalio'}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                </div>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 block line-clamp-1 max-w-[200px]">
                  @{owner.name ? owner.name.toLowerCase().replace(/\s+/g, '') : 'kadalio'} &bull; {owner.bio || 'Verified Creator'}
                </span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Bagikan Media"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Middle: Caption & Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800">
            {/* Caption Post */}
            <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-zinc-900/80">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 bg-slate-200 dark:bg-zinc-800">
                {owner.avatarUrl && <img src={owner.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />}
              </div>
              <div className="text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-zinc-100 mr-2">
                  {owner.name || 'Kadalio'}
                </span>
                <span className="text-slate-700 dark:text-zinc-300">
                  {renderCaptionWithHashtags(currentMedia.caption)}
                </span>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 pt-1">
              {currentComments.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-400 dark:text-zinc-500 border border-dashed border-slate-100 dark:border-zinc-800/60 rounded-2xl">
                  <p className="text-xs font-semibold">Belum ada tanggapan.</p>
                  <p className="text-[11px] mt-0.5 opacity-80">Jadilah yang pertama memberikan komentar untuk foto/video ini!</p>
                </div>
              ) : (
                currentComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 group animate-fade-in">
                    <img
                      src={comment.avatar}
                      alt={comment.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200 dark:border-zinc-800"
                    />
                    <div className="flex-1 text-xs">
                      <div className="bg-slate-50 dark:bg-zinc-900/80 p-2.5 rounded-2xl border border-slate-100 dark:border-zinc-800/60">
                        <span className="font-bold text-slate-900 dark:text-zinc-200 mr-1.5">{comment.name}</span>
                        <span className="text-slate-600 dark:text-zinc-300 leading-relaxed">{comment.text}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 ml-2 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                        <span>{comment.time}</span>
                        <button className="hover:text-slate-600 dark:hover:text-zinc-300 font-semibold cursor-pointer">Balas</button>
                      </div>
                    </div>
                    <button className="p-1 text-slate-300 dark:text-zinc-700 hover:text-rose-500 dark:hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Bottom: Instagram Action Bar & Comment Input */}
          <div className="border-t border-slate-100 dark:border-zinc-800/80 p-4 bg-white dark:bg-zinc-950 space-y-3">
            {/* Action Icons: Like, Comment, Share, Bookmark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLikeToggle}
                  className="group flex items-center gap-1.5 focus:outline-none cursor-pointer transition-transform active:scale-125"
                  title="Suka (Like)"
                >
                  <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-rose-500 text-rose-500 scale-110 animate-bounce' : 'text-slate-700 dark:text-zinc-300 group-hover:text-rose-500'}`} />
                </button>

                <button
                  onClick={() => document.getElementById('gallery-comment-input')?.focus()}
                  className="text-slate-700 dark:text-zinc-300 hover:text-blue-500 transition-colors cursor-pointer"
                  title="Beri Komentar"
                >
                  <MessageCircle className="w-6 h-6" />
                </button>

                <button
                  onClick={handleShare}
                  className="text-slate-700 dark:text-zinc-300 hover:text-purple-500 transition-colors cursor-pointer"
                  title="Bagikan"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={handleBookmarkToggle}
                className="text-slate-700 dark:text-zinc-300 hover:text-amber-500 transition-colors cursor-pointer active:scale-125"
                title="Simpan ke Koleksi"
              >
                <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </div>

            {/* Likes Counter & Date */}
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-slate-900 dark:text-zinc-100">
                {count.toLocaleString('id-ID')} suka
              </span>
              <span className="block text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono tracking-wider">
                {formattedDate}
              </span>
            </div>

            {/* Quick Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-900">
              <input
                id="gallery-comment-input"
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Tambahkan komentar..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none py-1.5"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:text-blue-500 disabled:opacity-40 transition-opacity cursor-pointer flex items-center gap-1"
              >
                <span>Kirim</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
