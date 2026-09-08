'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import StoryViewer, { StoryType, UserStoryGroup } from './StoryViewer';

interface StoryReelProps {
  stories: StoryType[];
  isOwner?: boolean;
}

export default function StoryReel({ stories, isOwner }: StoryReelProps) {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(new Set());

  // Load viewed stories from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('viewed_story_ids');
      if (saved) {
        setViewedStoryIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {}
  }, []);

  const handleStoryViewed = useCallback((storyId: string) => {
    setViewedStoryIds(prev => {
      if (prev.has(storyId)) return prev;
      const next = new Set(prev);
      next.add(storyId);
      try {
        localStorage.setItem('viewed_story_ids', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  }, []);

  // Group stories by user, sort chronologically, and determine viewed status
  const userGroups = useMemo(() => {
    const map = new Map<string, UserStoryGroup>();
    
    stories.forEach(story => {
      const key = story.user.name || 'User';
      if (!map.has(key)) {
        map.set(key, {
          userId: key,
          user: story.user,
          stories: []
        });
      }
      map.get(key)!.stories.push(story);
    });

    const groups = Array.from(map.values());

    // 1. Sort stories within each group chronologically (oldest first, newest last) like Instagram!
    groups.forEach(group => {
      group.stories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      // Check if all stories in this group have been viewed
      group.isAllViewed = group.stories.every(s => viewedStoryIds.has(s.id));
    });

    // 2. Sort groups on the reel: Unviewed users first, Viewed users last!
    groups.sort((a, b) => {
      if (a.isAllViewed === b.isAllViewed) {
        // Sort by newest story timestamp descending
        const maxA = Math.max(...a.stories.map(s => new Date(s.createdAt).getTime()));
        const maxB = Math.max(...b.stories.map(s => new Date(s.createdAt).getTime()));
        return maxB - maxA;
      }
      return a.isAllViewed ? 1 : -1;
    });

    return groups;
  }, [stories, viewedStoryIds]);

  if (!userGroups.length && !isOwner) return null;

  return (
    <>
      <div className="flex items-center gap-4 py-2 overflow-x-auto scrollbar-hide mb-4">
        {isOwner && (
          <Link 
            href="/admin/stories/new"
            className="group flex flex-col items-center gap-1.5 flex-shrink-0 focus:outline-none"
          >
            <div className="relative p-0.5 rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 group-hover:scale-105 transition-all">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-900/80 flex items-center justify-center text-slate-500 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shadow-sm">
                <Plus className="w-6 h-6" />
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 max-w-[70px] truncate">
              + Story
            </span>
          </Link>
        )}

        {userGroups.map((group, index) => {
          const avatar = group.user.avatarUrl || group.user.image;
          const isViewed = group.isAllViewed;

          return (
            <button 
              key={group.userId}
              onClick={() => setActiveGroupIndex(index)}
              className="group flex flex-col items-center gap-1.5 flex-shrink-0 focus:outline-none cursor-pointer"
            >
              {/* Ring color: Vibrant gradient if unviewed, Grey if viewed (Instagram style!) */}
              <div className={`relative p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                isViewed 
                  ? 'bg-slate-300 dark:bg-zinc-700 opacity-75' 
                  : 'bg-gradient-to-tr from-yellow-500 via-rose-500 to-fuchsia-600 shadow-md'
              }`}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white dark:border-zinc-950 bg-slate-100 dark:bg-zinc-900 relative">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600">
                      {(group.user.name || 'A')[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className={`text-xs font-medium max-w-[70px] truncate ${
                isViewed ? 'text-slate-400 dark:text-zinc-500' : 'text-slate-700 dark:text-zinc-300'
              }`}>
                {group.user.name?.split(' ')[0] || 'User'}
              </span>
            </button>
          );
        })}
      </div>

      {activeGroupIndex !== null && (
        <StoryViewer 
          userGroups={userGroups} 
          initialGroupIndex={activeGroupIndex} 
          onClose={() => setActiveGroupIndex(null)} 
          onStoryViewed={handleStoryViewed}
        />
      )}
    </>
  );
}
