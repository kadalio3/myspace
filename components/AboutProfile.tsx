'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Grid,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  MapPin,
  Link as LinkIcon,
  Sparkles,
  Code,
  Laptop,
  Rocket,
  Coffee,
  Mail,
  Award,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Plus,
  Edit3,
  Upload,
  Loader2,
  Save,
  X,
  Maximize2
} from 'lucide-react';
import { showToast } from '@/components/ToastProvider';
import { updateProfileBioAction } from '@/lib/actions/user.actions';
import StoryViewer, { StoryType, UserStoryGroup } from './StoryViewer';
import InstagramGalleryModal from './InstagramGalleryModal';

interface PostItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  coverImageUrl?: string | null;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  postCount: number;
}

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
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
}

interface AboutProfileProps {
  owner: OwnerData;
  categories: CategoryItem[];
  media: MediaItem[];
  posts: PostItem[];
  stories?: StoryType[];
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  isOwner: boolean;
}

export default function AboutProfile({
  owner,
  categories,
  media,
  posts,
  stories = [],
  totalPosts,
  totalLikes,
  totalComments,
  isOwner
}: AboutProfileProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'journey'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isViewingStory, setIsViewingStory] = useState(false);

  // Instagram Gallery Modal State
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  // Edit Bio & Journey State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(owner.name || 'Kadalio');
  const [editAvatarUrl, setEditAvatarUrl] = useState(owner.avatarUrl || '');
  const [editBio, setEditBio] = useState(owner.bio || '🚀 Berbagi pemikiran, eksplorasi teknologi modern, dan catatan perjalanan pengembangan perangkat lunak.');
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Media Upload State
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Group stories for StoryViewer
  const userGroups: UserStoryGroup[] = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    return [{
      userId: 'owner',
      user: {
        name: owner.name || 'Kadalio',
        avatarUrl: owner.avatarUrl
      },
      stories: [...stories].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }];
  }, [stories, owner]);

  const handleAvatarClick = () => {
    if (stories && stories.length > 0) {
      setIsViewingStory(true);
    } else {
      showToast('✨ Belum ada story aktif dalam 24 jam terakhir.', 'info');
    }
  };

  const handleFollow = () => {
    setIsFollowing(prev => !prev);
    if (!isFollowing) {
      showToast('🎉 Terima kasih telah mengikuti Kadalio!', 'success');
    } else {
      showToast('Anda berhenti mengikuti Kadalio.', 'info');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Tautan profil berhasil disalin ke clipboard!', 'success');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBio(true);
    try {
      await updateProfileBioAction({
        name: editName,
        bio: editBio,
        avatarUrl: editAvatarUrl || undefined
      });
      showToast('✨ Profil dan cerita perjalanan berhasil diperbarui!', 'success');
      setIsEditingProfile(false);
      router.refresh();
    } catch (error: any) {
      showToast(error.message || 'Gagal menyimpan profil', 'error');
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Gagal mengunggah media');
      }

      showToast('📸 Foto/Video berhasil diunggah ke galeri!', 'success');
      router.refresh();
    } catch (error: any) {
      showToast(error.message || 'Gagal mengunggah foto', 'error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const username = `@${(owner.name || 'kadalio').toLowerCase().replace(/\s+/g, '_')}`;

  // Color palette for highlights
  const highlightColors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-violet-500 to-purple-500'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in">
      {/* Instagram Profile Header */}
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          {/* Avatar with Story Ring - Clickable to open Story Viewer! */}
          <button 
            type="button"
            onClick={handleAvatarClick}
            className="relative group flex-shrink-0 cursor-pointer focus:outline-none"
            title={stories.length > 0 ? "Klik untuk melihat Story (Aktif 24 Jam)" : "Belum ada story aktif"}
          >
            <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 transition-all duration-300 group-hover:scale-105 ${
              stories.length > 0 
                ? 'bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 shadow-xl animate-pulse' 
                : 'bg-slate-300 dark:bg-zinc-700 shadow-md'
            }`}>
              <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 p-1">
                {owner.avatarUrl ? (
                  <img
                    src={owner.avatarUrl}
                    alt={owner.name || 'Owner'}
                    className="w-full h-full rounded-full object-cover shadow-inner"
                  />
                ) : (
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl shadow-inner relative">
                    <span>{(owner.name || 'K').charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full shadow-md border-2 border-white dark:border-zinc-900" title="Verified Owner">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            {stories.length > 0 && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-purple-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                Story
              </span>
            )}
          </button>

          {/* Profile Info & Stats */}
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                  {username}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 fill-blue-500/10" />
                <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold ml-1">
                  OWNER
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleFollow}
                  className={`px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${isFollowing
                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:scale-105 active:scale-95'
                    }`}
                >
                  {isFollowing ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Mengikuti</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-white/20" />
                      <span>Ikuti</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${owner.email || 'contact@kadalio.com'}`}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Pesan</span>
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                  title="Bagikan Profil"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                      setActiveTab('journey');
                    }}
                    className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Edit Profil & Perjalanan"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden md:inline">Edit</span>
                  </button>
                )}
              </div>
            </div>

            {/* Instagram Stats Row */}
            <div className="flex items-center justify-center sm:justify-start gap-8 sm:gap-12 py-3 border-y border-slate-100 dark:border-zinc-800/80 mb-4">
              <div className="text-center sm:text-left">
                <span className="block text-lg sm:text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                  {totalPosts}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">kiriman</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-lg sm:text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                  {totalLikes > 0 ? `${totalLikes}` : '0'}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">suka / claps</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-lg sm:text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                  {totalComments > 0 ? `${totalComments}` : '0'}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">interaksi</span>
              </div>
            </div>

            {/* Bio (From Database) */}
            <div className="space-y-1.5 text-xs sm:text-sm">
              <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-1.5">
                <span>{owner.name || 'Kadalio'}</span>
                <span className="text-slate-400 dark:text-zinc-600 font-normal">|</span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">PKPM Ahli Pertama</span>
              </h2>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed max-w-xl whitespace-pre-wrap">
                {owner.bio || '🚀 Berbagi pemikiran, eksplorasi teknologi modern, dan catatan perjalanan pengembangan perangkat lunak.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Sintang, Indonesia
                </span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  github.com/kadalio3
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Story Highlights / Sorotan (Managed by User in Categories) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sorotan Topik ({categories.length})</span>
            </h3>
            {isOwner && (
              <Link
                href="/admin/categories"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kelola Sorotan / Kategori</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 scrollbar-hide">
            {categories.map((cat, idx) => {
              const colorClass = highlightColors[idx % highlightColors.length];
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => showToast(`✨ Sorotan Topik: ${cat.name} (${cat.postCount} artikel)`, 'info')}
                  className="flex flex-col items-center gap-2 group flex-shrink-0 cursor-pointer"
                >
                  <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 bg-gradient-to-tr ${colorClass} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border-2 border-white dark:border-zinc-950">
                      <span className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-zinc-200 group-hover:text-blue-500 transition-colors">
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors max-w-[70px] truncate">
                      {cat.name}
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      {cat.postCount} pos
                    </span>
                  </div>
                </button>
              );
            })}

            {/* "+ Tambah Sorotan" button for Owner */}
            {isOwner && (
              <Link
                href="/admin/categories"
                className="flex flex-col items-center gap-2 group flex-shrink-0 cursor-pointer"
                title="Tambah Sorotan Baru di Admin Kategori"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 transition-all flex items-center justify-center bg-slate-50 dark:bg-zinc-900/50 group-hover:scale-110">
                  <Plus className="w-6 h-6 text-slate-400 dark:text-zinc-500 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-blue-600 dark:text-blue-400">
                    + Tambah
                  </span>
                  <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    Sorotan
                  </span>
                </div>
              </Link>
            )}

            {categories.length === 0 && !isOwner && (
              <p className="text-xs text-slate-400 dark:text-zinc-500 py-4">Belum ada sorotan yang ditambahkan.</p>
            )}
          </div>
        </div>
      </div>

      {/* Instagram Navigation Tabs */}
      <div className="border-t border-slate-200 dark:border-zinc-800 mb-8">
        <div className="flex items-center justify-center gap-6 sm:gap-16">
          {/* Tab 1: Posts */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('posts');
              setIsEditingProfile(false);
            }}
            className={`py-4 px-3 flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-t-2 -mt-px cursor-pointer ${activeTab === 'posts'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white scale-105'
              : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
          >
            <Grid className="w-4 h-4" />
            <span>Posts ({posts.length})</span>
          </button>

          {/* Tab 2: Media */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('media');
              setIsEditingProfile(false);
            }}
            className={`py-4 px-3 flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-t-2 -mt-px cursor-pointer ${activeTab === 'media'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white scale-105'
              : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Foto / Video ({media.length})</span>
          </button>

          {/* Tab 3: Perjalanan */}
          <button
            type="button"
            onClick={() => setActiveTab('journey')}
            className={`py-4 px-3 flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-t-2 -mt-px cursor-pointer ${activeTab === 'journey'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white scale-105'
              : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
          >
            <Award className="w-4 h-4" />
            <span>Perjalanan</span>
          </button>
        </div>
      </div>

      {/* Tab 1: POSTS Grid */}
      {activeTab === 'posts' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post, idx) => {
              const gradients = [
                'from-blue-600 via-indigo-600 to-purple-700',
                'from-emerald-600 via-teal-600 to-cyan-700',
                'from-purple-600 via-pink-600 to-rose-700',
                'from-amber-600 via-orange-600 to-rose-700',
                'from-cyan-600 via-blue-600 to-indigo-700',
                'from-rose-600 via-purple-600 to-indigo-700'
              ];
              const gradient = gradients[idx % gradients.length];
              const cleanExcerpt = post.content.replace(/[#*`_\[\]]/g, '').substring(0, 90) + '...';

              return (
                <Link key={post.id} href={`/post/${post.slug}`} className="block group">
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-zinc-800 shadow-sm group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1.5">
                    {/* Cover Image or Gradient */}
                    {post.coverImageUrl ? (
                      <img src={post.coverImageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:scale-105 transition-transform duration-500`} />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />

                    {/* Content inside Card */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
                      <div className="flex items-center justify-between">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                          {post.category || 'Tech'}
                        </span>
                        <span className="text-[10px] text-white/80 font-mono">
                          {new Date(post.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-base sm:text-lg leading-snug line-clamp-2 mb-2 text-white group-hover:text-blue-200 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-white/80 line-clamp-2 font-normal">
                          {cleanExcerpt}
                        </p>
                      </div>

                      {/* Hover Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs font-bold">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 fill-white text-white" />
                            <span>{post.likesCount || 0}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 fill-white text-white" />
                            <span>{post.commentsCount || 0}</span>
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold group-hover:translate-x-1 transition-transform">
                          <span>Baca</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-zinc-900/20 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
              <Grid className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-zinc-300">Belum Ada Kiriman</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-500">Artikel yang dipublikasikan akan muncul dalam format grid di sini.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: MEDIA (Instagram Gallery Lightbox Grid) */}
      {activeTab === 'media' && (
        <div className="space-y-6 animate-fade-in">
          {/* Owner Media Upload Header */}
          {isOwner && (
            <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Kelola Galeri Foto & Video</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Unggah foto atau video baru untuk ditampilkan pada grid media profil Anda.</p>
                </div>
              </div>

              <label className={`px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 ${isUploadingMedia ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUploadingMedia ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Unggah Foto / Video</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={isUploadingMedia}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Instagram Media Grid - Clickable to open Lightbox Modal! */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {media.map((item, idx) => {
              const isVideo = item.type === 'VIDEO' || item.url.match(/\.(mp4|webm|mov)$/i);
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedMediaIndex(idx)}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-zinc-800 shadow-sm group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  title="Klik untuk membuka di Instagram Gallery Lightbox"
                >
                  {isVideo ? (
                    <video src={item.url} className="w-full h-full object-cover" muted loop playsInline />
                  ) : (
                    <img src={item.url} alt="Uploaded media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  )}
                  
                  {/* Video Badge in Top Right */}
                  {isVideo && (
                    <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                      <Video className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Instagram Style Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 text-white font-bold text-sm">
                    <span className="flex items-center gap-1 drop-shadow-md">
                      <Heart className="w-5 h-5 fill-white" />
                      <span>{item.likesCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 drop-shadow-md">
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span>{item.commentsCount || (item.commentsList?.length || 0)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {media.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-zinc-900/20 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
              <ImageIcon className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-zinc-300">Belum Ada Foto atau Video</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-500">
                {isOwner
                  ? 'Klik tombol "Unggah Foto / Video" di atas untuk menambahkan media pertama Anda!'
                  : 'Penulis belum mengunggah foto atau video di galeri ini.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: PERJALANAN */}
      {activeTab === 'journey' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">Perjalanan & Filosofi</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Mengenal lebih dekat visi dan perjalanan di balik pembuatan platform ini.</p>
                </div>
              </div>

              {isOwner && !isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Perjalanan / Profil</span>
                </button>
              )}
            </div>

            {/* If Owner is editing their Journey / Bio */}
            {isEditingProfile && isOwner ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 bg-slate-50 dark:bg-zinc-900/80 p-5 rounded-2xl border border-purple-500/30 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Mode Edit Profil & Cerita Perjalanan</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Nama Tampilan</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Avatar URL (Opsional)</label>
                    <input
                      type="url"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Cerita Perjalanan & Biografi</label>
                  <textarea
                    rows={6}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tuliskan cerita perjalanan, visi, dan filosofi Anda di sini..."
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl p-4 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 shadow-sm leading-relaxed"
                    required
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Tips: Teks ini akan ditampilkan langsung di Bio profil dan tab Perjalanan Anda.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingBio}
                    className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavingBio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap">
                {owner.bio ? (
                  <p>{owner.bio}</p>
                ) : (
                  <>
                    <p>
                      Halo! Saya <strong>{owner.name || 'Kadalio'}</strong>, pengembang dan penulis di balik platform blog ini.
                    </p>
                    <p>
                      Blog ini didirikan sebagai wadah digital (*digital garden*) untuk mengarsipkan pemikiran teknis, hasil eksperimen, serta berbagi pengetahuan dengan seluruh pembaca.
                    </p>
                    <p>
                      Saya percaya bahwa kode dan tulisan yang baik bukan hanya tentang menyampaikan informasi, melainkan tentang keterbacaan, keindahan antarmuka, serta memberikan inspirasi baru bagi penggunanya.
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/posts"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-105"
                >
                  Baca Tulisan Saya
                </Link>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm transition-all"
                >
                  Kembali ke Beranda
                </Link>
              </div>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                &copy; {new Date().getFullYear()} {owner.name || 'Kadalio'} Blog
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal (Opens directly when clicking the profile picture!) */}
      {isViewingStory && userGroups.length > 0 && (
        <StoryViewer
          userGroups={userGroups}
          initialGroupIndex={0}
          onClose={() => setIsViewingStory(false)}
          onStoryViewed={() => {}}
        />
      )}

      {/* Instagram Gallery Lightbox Modal (Opens when clicking any photo/video in Media grid!) */}
      {selectedMediaIndex !== null && (
        <InstagramGalleryModal
          media={media}
          initialIndex={selectedMediaIndex}
          owner={owner}
          onClose={() => setSelectedMediaIndex(null)}
        />
      )}
    </div>
  );
}
