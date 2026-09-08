'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700/50 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      title={theme === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
      className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 transition-all hover:scale-105 flex items-center justify-center shadow-sm cursor-pointer focus:outline-none"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 animate-bounce-short" />
      )}
    </button>
  );
}
