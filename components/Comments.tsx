'use client';

import { useState } from 'react';

type CommentType = {
  id: string;
  content: string;
  guestName: string | null;
  createdAt: string;
  user: { name: string | null; avatarUrl: string | null; role: string } | null;
  replies?: CommentType[];
};

interface CommentsProps {
  postId: string;
  initialComments: CommentType[];
  isAuthenticated: boolean;
}

export default function Comments({ postId, initialComments, isAuthenticated }: CommentsProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      setError('Name and Email are required for guests.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content, guestName, guestEmail }),
      });

      if (!res.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await res.json();
      setComments([data.comment, ...comments]);
      setContent('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-slate-200 dark:border-zinc-800 pt-12">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-8">Komentar ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="mb-12 space-y-4">
        {!isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none shadow-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none shadow-sm"
            />
          </div>
        )}
        <textarea
          rows={4}
          placeholder="Tulis komentar Anda di sini..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none resize-y shadow-sm"
        />
        {error && <p className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-xl transition-colors text-sm shadow-sm cursor-pointer"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              {comment.user?.avatarUrl ? (
                <img src={comment.user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 object-cover border border-slate-200 dark:border-zinc-700" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-sm text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700">
                  {(comment.user?.name || comment.guestName || 'A').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 bg-white dark:bg-zinc-900/50 p-4 sm:p-5 rounded-2xl rounded-tl-none border border-slate-200 dark:border-zinc-800/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                  {comment.user?.name || comment.guestName}
                </span>
                {comment.user?.role === 'OWNER' && (
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-full font-extrabold">AUTHOR</span>
                )}
                <span className="text-xs text-slate-500 dark:text-zinc-500 ml-auto font-mono">
                  {new Date(comment.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              <p className="text-slate-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-zinc-900/20 border border-dashed border-slate-300 dark:border-zinc-800 rounded-3xl shadow-sm">
            <p className="text-slate-500 dark:text-zinc-500 text-sm font-medium">
              Belum ada komentar. Jadilah yang pertama memberikan tanggapan!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
