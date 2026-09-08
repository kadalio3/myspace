'use client';

import { useState } from 'react';
import { Image as ImageIcon, Video, Heart, MessageCircle, Grid, Filter } from 'lucide-react';
import InstagramGalleryModal from './InstagramGalleryModal';

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

interface GalleryViewProps {
  media: MediaItem[];
  owner: OwnerData;
  showFilter?: boolean;
  emptyMessage?: string;
  gridCols?: string;
}

export default function GalleryView({
  media,
  owner,
  showFilter = false,
  emptyMessage = 'Belum ada foto atau video dalam galeri ini.',
  gridCols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
}: GalleryViewProps) {
  const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredMedia = media.filter(item => {
    if (filter === 'ALL') return true;
    const isVid = item.type === 'VIDEO' || item.url.match(/\.(mp4|webm|mov)$/i);
    if (filter === 'VIDEO') return isVid;
    return !isVid;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter Tabs (Optional for full gallery page) */}
      {showFilter && media.length > 0 && (
        <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Semua ({media.length})</span>
          </button>
          <button
            onClick={() => setFilter('IMAGE')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'IMAGE'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto</span>
          </button>
          <button
            onClick={() => setFilter('VIDEO')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'VIDEO'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>
        </div>
      )}

      {/* Media Grid */}
      <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
        {filteredMedia.map((item, idx) => {
          const isVideo = item.type === 'VIDEO' || item.url.match(/\.(mp4|webm|mov)$/i);
          const likesCount = item.likesCount || 0;
          const commentsCount = item.commentsCount || (item.commentsList?.length || 0);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedIndex(idx)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-zinc-800 shadow-sm group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              title="Klik untuk melihat di Instagram Gallery Lightbox"
            >
              {isVideo ? (
                <video src={item.url} className="w-full h-full object-cover" muted loop playsInline />
              ) : (
                <img src={item.url} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              )}

              {/* Video Badge */}
              {isVideo && (
                <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-md shadow-md">
                  <Video className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Instagram Style Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 text-white font-bold text-sm">
                <span className="flex items-center gap-1 drop-shadow-md">
                  <Heart className="w-5 h-5 fill-white" />
                  <span>{likesCount}</span>
                </span>
                <span className="flex items-center gap-1 drop-shadow-md">
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>{commentsCount}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/20 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
          <ImageIcon className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-zinc-300 mb-1">Galeri Kosong</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mx-auto">{emptyMessage}</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <InstagramGalleryModal
          media={filteredMedia}
          initialIndex={selectedIndex}
          owner={owner}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
}
