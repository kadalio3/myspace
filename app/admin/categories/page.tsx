import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createCategoryAction, deleteCategoryAction } from '@/lib/actions/category.actions';
import { Tag, Plus, Trash2 } from 'lucide-react';

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') return null;

  let categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  // Auto-seed default categories if database is empty so owner has a great starting point!
  if (categories.length === 0) {
    const presets = [
      'Teknologi', 'Arsitektur Software', 'Tutorial & Tips', 
      'Kehidupan Pribadi', 'Karir & Bisnis', 'Opini & Pemikiran', 
      'Eksplorasi AI', 'Web Development'
    ];
    for (const name of presets) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug, color: '#3b82f6' }
      });
    }
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Count posts for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat: any) => {
      const count = await prisma.post.count({
        where: { category: cat.name },
      });
      return { ...cat, postCount: count };
    })
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            Category Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Buat, kelola, dan hapus topik kategori untuk mengelompokkan artikel blog Anda.
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2 self-start sm:self-center shadow-sm">
          <Tag className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>Total Categories: {categories.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Category Form */}
        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl h-fit transition-all">
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span>Add New Category</span>
          </h2>
          <form action={createCategoryAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                Category Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Artificial Intelligence"
                className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl py-3 text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Save Category
            </button>
          </form>
        </div>

        {/* Categories List Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Slug</th>
                  <th className="py-4 px-6">Posts Used</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/50">
                {categoriesWithCount.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-6 text-center text-slate-500 dark:text-zinc-500 text-sm">
                      Belum ada kategori yang dibuat.
                    </td>
                  </tr>
                ) : (
                  categoriesWithCount.map((cat: any) => (
                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group">
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-500 dark:text-emerald-400/80" />
                        <span>{cat.name}</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                        <span className="bg-slate-100 dark:bg-zinc-950/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium">
                        <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">
                          {cat.postCount} artikel
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <form
                          action={async () => {
                            'use server';
                            await deleteCategoryAction(cat.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="p-2 text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer focus:outline-none"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
