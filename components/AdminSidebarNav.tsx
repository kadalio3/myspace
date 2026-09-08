'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Tag, 
  Users, 
  Sparkles, 
  UserPlus, 
  PlusCircle,
  ChevronDown,
  ChevronRight,
  Archive,
  BookOpen,
  History,
  Shield,
  Activity,
  Image as ImageIcon,
  Settings
} from 'lucide-react';

export default function AdminSidebarNav() {
  const pathname = usePathname();

  // Determine initial expanded state based on current pathname
  const isPostsActive = pathname.startsWith('/admin/posts') || pathname.startsWith('/admin/categories');
  const isStoryActive = pathname.startsWith('/admin/stories');
  const isUsersActive = pathname.startsWith('/admin/users');

  const [openSection, setOpenSection] = useState<'posts' | 'story' | 'users' | null>(() => {
    if (isPostsActive) return 'posts';
    if (isStoryActive) return 'story';
    if (isUsersActive) return 'users';
    return 'posts'; // Default open posts
  });

  // Keep accordion open if user navigates to a route inside it
  useEffect(() => {
    if (isPostsActive) setOpenSection('posts');
    else if (isStoryActive) setOpenSection('story');
    else if (isUsersActive) setOpenSection('users');
  }, [pathname, isPostsActive, isStoryActive, isUsersActive]);

  const toggleSection = (section: 'posts' | 'story' | 'users') => {
    setOpenSection(prev => prev === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* 1. Overview & Media */}
      <div className="space-y-1">
        <Link 
          href="/admin" 
          className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 group ${
            pathname === '/admin' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/80'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin' ? 'text-white' : 'text-blue-500 dark:text-blue-400'} group-hover:scale-110 transition-transform`} />
          <span>Dashboard Overview</span>
        </Link>

        <Link 
          href="/admin/media" 
          className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${
            pathname === '/admin/media' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <ImageIcon className={`w-4 h-4 ${pathname === '/admin/media' ? 'text-white' : 'text-purple-500 dark:text-purple-400'} group-hover:scale-110 transition-transform`} />
            <span>Galeri &amp; Media</span>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <span>FILE</span>
          </span>
        </Link>

        <Link 
          href="/admin/logs" 
          className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${
            pathname === '/admin/logs' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <Activity className={`w-4 h-4 ${pathname === '/admin/logs' ? 'text-white' : 'text-cyan-500 dark:text-cyan-400'} group-hover:scale-110 transition-transform`} />
            <span>Activity &amp; Visit Logs</span>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
            <span>LIVE</span>
          </span>
        </Link>

        <Link 
          href="/admin/settings" 
          className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${
            pathname === '/admin/settings' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings className={`w-4 h-4 ${pathname === '/admin/settings' ? 'text-white' : 'text-amber-500 dark:text-amber-400'} group-hover:scale-110 transition-transform`} />
            <span>Pengaturan SEO &amp; Iklan</span>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <span>CONFIG</span>
          </span>
        </Link>
      </div>

      <div className="h-px bg-slate-200 dark:bg-zinc-800/80 my-2" />

      {/* 2. Posts Menu with Submenus */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => toggleSection('posts')}
          className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
            isPostsActive
              ? 'bg-slate-200/80 dark:bg-zinc-800/80 text-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="tracking-wide">Posts Menu</span>
          </div>
          <div className="flex items-center gap-1.5">
            {openSection === 'posts' ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {/* Posts Submenus */}
        {openSection === 'posts' && (
          <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-indigo-500/30 ml-4 animate-fade-in">
            <Link
              href="/admin/posts"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                pathname === '/admin/posts'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500/80" />
                <span>All Posts</span>
              </div>
            </Link>

            <Link
              href="/admin/posts/new"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                pathname === '/admin/posts/new'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-3.5 h-3.5 text-cyan-500/80" />
                <span>New Post</span>
              </div>
              <span className="text-[9px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded-full">+</span>
            </Link>

            <Link
              href="/admin/categories"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                pathname === '/admin/categories'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-3.5 h-3.5 text-emerald-500/80" />
                <span>Category List</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* 3. Story Menu with Submenus */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => toggleSection('story')}
          className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
            isStoryActive
              ? 'bg-slate-200/80 dark:bg-zinc-800/80 text-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="tracking-wide">Story Menu</span>
          </div>
          <div className="flex items-center gap-1.5">
            {openSection === 'story' ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {/* Story Submenus */}
        {openSection === 'story' && (
          <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-amber-500/30 ml-4 animate-fade-in">
            <Link
              href="/admin/stories/new"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                pathname === '/admin/stories/new'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/20 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Post Story</span>
              </div>
              <span className="text-[9px] bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-bold">24H</span>
            </Link>

            <Link
              href="/admin/stories/archive"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                pathname === '/admin/stories/archive'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/20 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-3.5 h-3.5 text-rose-500/80" />
                <span>Archive (&gt;24H)</span>
              </div>
              <span className="text-[9px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-full">Expired</span>
            </Link>
          </div>
        )}
      </div>

      {/* 4. User Management Menu with Submenus */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => toggleSection('users')}
          className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
            isUsersActive
              ? 'bg-slate-200/80 dark:bg-zinc-800/80 text-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span className="tracking-wide">User Management</span>
          </div>
          <div className="flex items-center gap-1.5">
            {openSection === 'users' ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {/* User Management Submenus */}
        {openSection === 'users' && (
          <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-rose-500/30 ml-4 animate-fade-in">
            <Link
              href="/admin/users"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                pathname === '/admin/users'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 font-bold border border-rose-500/20 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-3.5 h-3.5 text-rose-500/80" />
                <span>Users List</span>
              </div>
            </Link>

            <Link
              href="/admin/users/new"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                pathname === '/admin/users/new'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300 font-bold border border-blue-500/20 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                <span>Add User</span>
              </div>
              <span className="text-[9px] font-extrabold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">+</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
