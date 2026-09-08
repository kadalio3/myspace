'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export type StoryType = {
  id: string;
  caption: string | null;
  bgStyle?: string | null;
  createdAt: string;
  user: { name: string | null; avatarUrl: string | null; image?: string | null };
  media: { url: string }[];
};

export type UserStoryGroup = {
  userId: string;
  user: { name: string | null; avatarUrl: string | null; image?: string | null };
  stories: StoryType[];
  isAllViewed?: boolean;
};

interface StoryViewerProps {
  userGroups: UserStoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
  onStoryViewed: (storyId: string) => void;
}

const BG_GRADIENTS: Record<string, string> = {
  sunset: 'bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500',
  neon: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700',
  ocean: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700',
  gold: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600',
  rose: 'bg-gradient-to-br from-rose-600 via-red-600 to-pink-700',
  dark: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-black',
};

export default function StoryViewer({ userGroups, initialGroupIndex, onClose, onStoryViewed }: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const STORY_DURATION = 5000; // 5 seconds per story

  const currentGroup = userGroups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  // Mark story as viewed whenever currentStory changes
  useEffect(() => {
    if (currentStory) {
      onStoryViewed(currentStory.id);
    }
  }, [currentStory, onStoryViewed]);

  const nextStory = useCallback(() => {
    if (!currentGroup) return;

    if (storyIndex < currentGroup.stories.length - 1) {
      // Next story of the same user
      setStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (groupIndex < userGroups.length - 1) {
      // Next user's stories
      setGroupIndex(prev => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      // Finished all stories of all users
      onClose();
    }
  }, [currentGroup, storyIndex, groupIndex, userGroups.length, onClose]);

  const prevStory = useCallback(() => {
    if (!currentGroup) return;

    if (storyIndex > 0) {
      // Previous story of the same user
      setStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      // Previous user's last story
      const prevGroup = userGroups[groupIndex - 1];
      setGroupIndex(prev => prev - 1);
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  }, [currentGroup, storyIndex, groupIndex, userGroups]);

  useEffect(() => {
    if (progress >= 100) {
      nextStory();
    }
  }, [progress, nextStory]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => Math.min(100, p + (100 / (STORY_DURATION / 100))));
    }, 100);

    return () => clearInterval(timer);
  }, [groupIndex, storyIndex]);

  if (!currentGroup || !currentStory) return null;

  const imageUrl = currentStory.media[0]?.url;
  const isTextOnly = !imageUrl;
  const bgClass = BG_GRADIENTS[currentStory.bgStyle || 'sunset'] || BG_GRADIENTS.sunset;
  const avatar = currentGroup.user.avatarUrl || currentGroup.user.image;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center animate-fade-in">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-md cursor-pointer focus:outline-none"
      >
        <X className="w-6 h-6" />
      </button>

      <div className={`relative w-full max-w-[420px] h-[100dvh] md:h-[88vh] md:rounded-[36px] overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10 ${
        isTextOnly ? bgClass : 'bg-zinc-950'
      }`}>
        {/* Progress Bars (One bar per story of this user) */}
        <div className="absolute top-4 left-0 right-0 z-30 flex gap-1.5 px-4">
          {currentGroup.stories.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear shadow-sm"
                style={{ 
                  width: idx === storyIndex ? `${progress}%` : (idx < storyIndex ? '100%' : '0%') 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header (User Info) */}
        <div className="absolute top-8 left-0 right-0 z-30 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/40 bg-zinc-800 shadow-md">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600">
                  {(currentGroup.user.name || 'A')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <span className="text-white text-sm font-bold drop-shadow-md block leading-none">
                {currentGroup.user.name || 'User'}
              </span>
              <span className="text-white/70 text-[11px] drop-shadow-md mt-0.5 block">
                {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {currentGroup.stories.length > 1 && ` • ${storyIndex + 1}/${currentGroup.stories.length}`}
              </span>
            </div>
          </div>
        </div>

        {/* Story Content Area */}
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          {isTextOnly ? (
            /* Instagram Text Mode */
            <div className="px-8 text-center z-20 max-w-full animate-scale-up">
              <p className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-xl leading-relaxed tracking-tight break-words">
                {currentStory.caption || ''}
              </p>
            </div>
          ) : (
            /* Image Mode */
            <>
              <img 
                src={imageUrl} 
                alt="Story" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              {currentStory.caption && (
                <div className="absolute bottom-12 left-0 right-0 z-20 px-6 text-center">
                  <span className="inline-block bg-black/60 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow-2xl border border-white/10 max-w-full break-words">
                    {currentStory.caption}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation Overlays */}
        <div className="absolute inset-0 z-20 flex">
          <button 
            className="flex-1 opacity-0 hover:opacity-100 flex items-center justify-start px-2 bg-gradient-to-r from-black/20 to-transparent transition-opacity cursor-pointer focus:outline-none"
            onClick={prevStory}
          >
            <ChevronLeft className="w-10 h-10 text-white drop-shadow-lg" />
          </button>
          <button 
            className="flex-1 opacity-0 hover:opacity-100 flex items-center justify-end px-2 bg-gradient-to-l from-black/20 to-transparent transition-opacity cursor-pointer focus:outline-none"
            onClick={nextStory}
          >
            <ChevronRight className="w-10 h-10 text-white drop-shadow-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}
