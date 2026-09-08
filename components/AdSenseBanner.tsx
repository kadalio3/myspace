'use client';

import { useEffect, useState } from 'react';

interface AdSenseBannerProps {
  adSlot?: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  fullWidthResponsive?: boolean;
  className?: string;
  adSenseId?: string | null;
}

export default function AdSenseBanner({
  adSlot = 'default-slot',
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  adSenseId: propAdSenseId
}: AdSenseBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const adSenseId = propAdSenseId || (typeof window !== 'undefined' && (window as any).__ADSENSE_ID__) || process.env.NEXT_PUBLIC_ADSENSE_ID;
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (adSenseId && !isDev) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        setAdLoaded(true);
      } catch (err) {
        console.error('AdSense display error:', err);
      }
    }
  }, [adSenseId, isDev]);

  // If ID is not set or in local development mode, show a clean non-intrusive preview for the creator
  if (!adSenseId || isDev) {
    return (
      <div className={`my-8 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 text-center transition-all ${className}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
          <span>📢 Google AdSense Slot ({adFormat})</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-md mx-auto">
          {!adSenseId 
            ? 'AdSense ID belum dikonfigurasi di .env (NEXT_PUBLIC_ADSENSE_ID). Ruang ini adalah tempat iklan akan ditampilkan.' 
            : 'Mode Pengembangan: Iklan disembunyikan saat di dev server agar tidak melanggar kebijakan klik klik sendiri.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`my-8 overflow-hidden text-center ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={adSenseId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
