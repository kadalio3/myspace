import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";
import AnalyticsAndAds from "@/components/AnalyticsAndAds";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    if ((prisma as any).siteSetting?.findUnique) {
      settings = await (prisma as any).siteSetting.findUnique({
        where: { id: 'global' }
      });
    }
  } catch (e) {
    console.error('Failed to load SEO metadata from db during build/render:', e);
  }

  const titleText = settings?.siteTitle || 'Ruang Berpikir Kadalio';
  const descText = settings?.siteDescription || 'Eksplorasi teknologi modern, catatan perjalanan pengembangan perangkat lunak, dan dokumentasi visual Kadalio.';
  const keywordsText = settings?.siteKeywords || 'web development, nextjs 16, tailwind css, galeri visual, teknologi indonesia';

  return {
    title: {
      default: titleText,
      template: '%s | Kadalio',
    },
    description: descText,
    keywords: keywordsText.split(',').map((k: string) => k.trim()),
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'googlebot': 'noai, noimageai',
      'robots': 'noai, noimageai',
      'ai-train': 'no',
    },
    openGraph: {
      title: titleText,
      description: descText,
      url: 'https://kadalio.com',
      siteName: titleText,
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descText,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    if ((prisma as any).siteSetting?.findUnique) {
      settings = await (prisma as any).siteSetting.findUnique({
        where: { id: 'global' }
      });
    }
  } catch (e) {
    console.error('Failed to load settings in RootLayout:', e);
  }

  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 selection:bg-blue-500/30 selection:text-blue-600 dark:selection:text-blue-200 antialiased transition-colors duration-300">
        <Suspense fallback={null}>
          <AnalyticsAndAds gaId={settings?.googleAnalyticsId} adSenseId={settings?.googleAdsenseId} />
        </Suspense>
        <ToastProvider />
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
