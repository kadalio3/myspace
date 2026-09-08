'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Clock, ShieldAlert, Lock, BookOpen, Tag, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';

export type ArchivePostType = {
  id: string;
  title: string;
  content: string;
  slug: string;
  category: string;
  visibility: string;
  createdAt: string;
  user: {
    name: string | null;
    avatarUrl: string | null;
    image: string | null;
  };
};

interface PostArchiveProps {
  posts: ArchivePostType[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  categories: string[];
  initialCategory?: string;
  initialQuery?: string;
}

export default function PostArchive({
  posts,
  totalCount,
  currentPage,
  pageSize,
  categories,
  initialCategory = 'Semua',
  initialQuery = ''
}: PostArchiveProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Update URL when filters change
  const applyFilters = (cat: string, query: string, page: number = 1) => {
    const params = new URLSearchParams();
    if (cat && cat !== 'Semua') params.set('category', cat);
    if (query && query.trim() !== '') params.set('q', query.trim());
    if (page > 1) params.set('page', page.toString());

    const newUrl = `${pathname}?${params.toString()}`;
    startTransition(() => {
      router.push(newUrl, { scroll: false });
    });
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    applyFilters(cat, searchQuery, 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(selectedCategory, searchQuery, 1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    applyFilters(selectedCategory, '', 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    applyFilters(selectedCategory, searchQuery, newPage);
  };

  return (
    <div className={`space-y-8 animate-fade-in transition-opacity duration-200 ${isPending ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>
      {/* Search Bar & Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari artikel, topik, atau kata kunci..."
            className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-11 pr-20 py-3 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                title="Hapus Pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Cari
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400 self-start md:self-center">
          <BookOpen className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <span>Menampilkan <strong className="text-slate-900 dark:text-zinc-100">{posts.length}</strong> dari <strong className="text-slate-900 dark:text-zinc-100">{totalCount}</strong> tulisan</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-105'
                  : 'bg-white dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5 opacity-80" />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Post Grid */}
      <div className="grid gap-5">
        {posts.map((post) => {
          const readTime = Math.max(1, Math.ceil(post.content.length / 800));
          const avatar = post.user.avatarUrl || post.user.image;
          const isPrivate = post.visibility === 'PRIVATE';
          const isPassword = post.visibility === 'PASSWORD_PROTECTED';

          return (
            <Link key={post.id} href={`/post/${post.slug}`} className="block group">
              <article className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 group-hover:-translate-y-0.5">
                {/* Top Meta: Category & Visibility */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <Tag className="w-3 h-3" />
                      {post.category || 'Teknologi'}
                    </span>

                    <span className="text-slate-300 dark:text-zinc-700">•</span>

                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-zinc-300">
                        {avatar ? (
                          <img src={avatar} alt="Author" className="w-full h-full object-cover" />
                        ) : (
                          (post.user.name || 'A')[0].toUpperCase()
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-zinc-400">
                        {post.user.name || 'Kadalio'}
                      </span>
                    </div>

                    <span className="text-slate-300 dark:text-zinc-700">•</span>

                    <span className="text-xs text-slate-500 dark:text-zinc-500">
                      {new Date(post.createdAt).toLocaleDateString('id-ID', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPrivate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <ShieldAlert className="w-3 h-3" />
                        Private
                      </span>
                    )}
                    {isPassword && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        <Lock className="w-3 h-3" />
                        Protected
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Excerpt */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {post.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 line-clamp-2 mb-5 leading-relaxed font-normal">
                  {post.content.replace(/[#*`_\[\]]/g, '').substring(0, 220)}...
                </p>

                {/* Bottom Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-500 pt-3.5 border-t border-slate-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                    <span>{readTime} min read</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Baca selengkapnya &rarr;
                  </span>
                </div>
              </article>
            </Link>
          );
        })}

        {posts.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-zinc-900/20 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-zinc-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-zinc-300 mb-1">Tidak Ada Artikel Ditemukan</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-500 max-w-sm mx-auto mb-4">
              {searchQuery || selectedCategory !== 'Semua' 
                ? 'Coba gunakan kata kunci lain atau pilih kategori Semua untuk melihat artikel lainnya.'
                : 'Belum ada artikel yang dipublikasikan.'}
            </p>
            {(searchQuery || selectedCategory !== 'Semua') && (
              <button
                type="button"
                onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); applyFilters('Semua', '', 1); }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Filter & Pencarian
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Halaman <strong className="text-slate-900 dark:text-zinc-100">{currentPage}</strong> dari <strong className="text-slate-900 dark:text-zinc-100">{totalPages}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
