'use client';

import { useState, useRef } from 'react';
import ImageUploader from './ImageUploader';
import { Tag, Plus, Check, Sparkles } from 'lucide-react';

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    status: string;
    visibility: string;
    content: string;
    category?: string;
  };
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  categories?: string[];
}

const CATEGORY_PRESETS = [
  'Teknologi',
  'Arsitektur Software',
  'Tutorial & Tips',
  'Kehidupan Pribadi',
  'Karir & Bisnis',
  'Opini & Pemikiran',
  'Eksplorasi AI',
  'Web Development'
];

export default function PostForm({ initialData, action, submitLabel, categories }: PostFormProps) {
  const [content, setContent] = useState(initialData?.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const availableCategories = categories && categories.length > 0 ? categories : CATEGORY_PRESETS;
  
  const initialCat = initialData?.category || availableCategories[0] || 'Teknologi';
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [isCustom, setIsCustom] = useState(() => !availableCategories.includes(initialCat));
  const [customInput, setCustomInput] = useState(() => (!availableCategories.includes(initialCat) ? initialCat : ''));

  const handleImageUploaded = (url: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textToInsert = `\n![Uploaded Image](${url})\n`;

    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
      textarea.focus();
    }, 0);
  };

  const finalCategoryValue = isCustom ? customInput.trim() || 'Teknologi' : selectedCategory;

  return (
    <form action={action} className="space-y-6 animate-fade-in">
      {/* Hidden input to pass the actual selected/custom category to the server */}
      <input type="hidden" name="category" value={finalCategoryValue} />

      <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm dark:shadow-xl transition-all">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-slate-800 dark:text-zinc-200 mb-2">
            Judul Artikel <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={initialData?.title}
            placeholder="Tulis judul artikel yang menarik..."
            className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-inner text-sm font-semibold"
          />
        </div>

        {/* Improved Category Selector */}
        <div className="space-y-3 bg-slate-50/60 dark:bg-zinc-950/40 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800/60">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Pilih Topik Kategori</span>
            </label>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              {isCustom ? 'Ketik kategori baru di bawah' : `Terpilih: "${selectedCategory}"`}
            </span>
          </div>

          {/* Interactive Category Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {availableCategories.map((cat) => {
              const isSelected = !isCustom && selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setIsCustom(false);
                    setSelectedCategory(cat);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  <span>{cat}</span>
                </button>
              );
            })}

            {/* Custom Category Button */}
            <button
              type="button"
              onClick={() => {
                setIsCustom(true);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCustom
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 scale-105'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 hover:bg-purple-500/20'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Kategori Baru / Custom</span>
            </button>
          </div>

          {/* Custom Input Box when + Kategori Baru is selected */}
          {isCustom && (
            <div className="pt-2 animate-slide-down">
              <div className="relative">
                <Sparkles className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik nama kategori baru..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-purple-500/50 rounded-2xl text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 shadow-sm"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 pl-1 font-medium">
                Kategori ini akan otomatis ditambahkan ke dalam sistem saat artikel diterbitkan.
              </p>
            </div>
          )}
        </div>

        {/* Status & Visibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="status" className="block text-sm font-bold text-slate-800 dark:text-zinc-200 mb-2">
              Status Publikasi
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initialData?.status || 'DRAFT'}
              className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-all appearance-none text-sm font-semibold shadow-inner cursor-pointer"
            >
              <option value="DRAFT" className="bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 font-medium">Draft (Sembunyikan / Belum Rilis)</option>
              <option value="PUBLISHED" className="bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-bold">Published (Tampilkan ke Beranda)</option>
              <option value="ARCHIVED" className="bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400">Archived (Arsip)</option>
            </select>
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-bold text-slate-800 dark:text-zinc-200 mb-2">
              Hak Akses (Visibility)
            </label>
            <select
              id="visibility"
              name="visibility"
              defaultValue={initialData?.visibility || 'PUBLIC'}
              className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-all appearance-none text-sm font-semibold shadow-inner cursor-pointer"
            >
              <option value="PUBLIC" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-bold">Public (Semua Orang / Pengunjung)</option>
              <option value="PRIVATE" className="bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400">Private (Hanya Owner)</option>
              <option value="PASSWORD_PROTECTED" className="bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400">Password Protected</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label htmlFor="content" className="block text-sm font-bold text-slate-800 dark:text-zinc-200">
              Konten Artikel (Support Markdown &amp; Gambar) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <ImageUploader onUploadSuccess={handleImageUploaded} />
              <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Panduan Markdown
              </a>
            </div>
          </div>
          <textarea
            id="content"
            name="content"
            required
            rows={15}
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis isi artikel blog Anda di sini menggunakan Markdown atau teks biasa..."
            className="w-full font-mono text-sm bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 resize-y shadow-inner leading-relaxed"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
