'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

interface AnalyticsAndAdsProps {
  gaId?: string | null;
  adSenseId?: string | null;
}

export default function AnalyticsAndAds({ gaId: propGaId, adSenseId: propAdSenseId }: AnalyticsAndAdsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const gaId = propGaId || process.env.NEXT_PUBLIC_GA_ID || '';
  const adSenseId = propAdSenseId || process.env.NEXT_PUBLIC_ADSENSE_ID || '';

  // Store AdSense ID globally for AdSenseBanner components to access dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__ADSENSE_ID__ = adSenseId;
    }
  }, [adSenseId]);

  // SPA Route Change Tracking for GA4 in Next.js App Router
  useEffect(() => {
    if (gaId && typeof window !== 'undefined' && (window as any).gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      (window as any).gtag('config', gaId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, gaId]);

  return (
    <>
      {/* Google Analytics (GA4) */}
      {gaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* Google AdSense Auto Ads Verification */}
      {adSenseId && (
        <Script
          id="google-adsense-init"
          strategy="afterInteractive"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
