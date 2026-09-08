'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
}

export default function LikeButton({ postId, initialLiked, initialLikeCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    // Optimistic Update
    setIsLiking(true);
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await res.json();
      // Sync state with server reality if needed
      setLiked(data.liked);
    } catch (error) {
      console.error(error);
      // Revert optimistic update on failure
      setLiked(liked);
      setLikeCount(initialLikeCount);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button 
      onClick={handleLike}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
        liked 
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' 
          : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-rose-500/30 hover:text-rose-400'
      }`}
    >
      <Heart 
        className={`w-5 h-5 transition-transform duration-300 ${liked ? 'fill-rose-500 scale-110' : 'group-hover:scale-110'}`} 
      />
      <span className="font-medium text-sm">{likeCount}</span>
    </button>
  );
}
