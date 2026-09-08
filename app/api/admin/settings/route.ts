import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    let settings = await prisma.siteSetting.findUnique({
      where: { id: 'global' }
    });

    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: {
          id: 'global',
          siteTitle: 'Kadalio — Catatan & Dokumentasi Web',
          siteDescription: 'Catatan pemikiran, dokumentasi teknis pengembangan web, dan galeri eksplorasi visual.',
          siteKeywords: 'web development, nextjs 16, tailwind css, galeri visual, teknologi, programming indonesia, dokumentasi teknis',
          googleAnalyticsId: '',
          googleAdsenseId: '',
          adsenseAutoAds: true
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized. Hanya Owner yang dapat mengubah pengaturan.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      siteTitle,
      siteDescription,
      siteKeywords,
      googleAnalyticsId,
      googleAdsenseId,
      adsenseAutoAds
    } = body;

    const updated = await prisma.siteSetting.upsert({
      where: { id: 'global' },
      update: {
        siteTitle: siteTitle?.trim() || 'Kadalio — Catatan & Dokumentasi Web',
        siteDescription: siteDescription?.trim() || '',
        siteKeywords: siteKeywords?.trim() || '',
        googleAnalyticsId: googleAnalyticsId?.trim() || '',
        googleAdsenseId: googleAdsenseId?.trim() || '',
        adsenseAutoAds: Boolean(adsenseAutoAds)
      },
      create: {
        id: 'global',
        siteTitle: siteTitle?.trim() || 'Kadalio — Catatan & Dokumentasi Web',
        siteDescription: siteDescription?.trim() || '',
        siteKeywords: siteKeywords?.trim() || '',
        googleAnalyticsId: googleAnalyticsId?.trim() || '',
        googleAdsenseId: googleAdsenseId?.trim() || '',
        adsenseAutoAds: Boolean(adsenseAutoAds)
      }
    });

    // Log admin action
    await prisma.activityLog.create({
      data: {
        type: 'SECURITY',
        action: 'UPDATE_SETTINGS',
        title: 'Pengaturan Global & SEO Diperbarui',
        description: `Owner memperbarui konfigurasi SEO, Google Analytics, dan AdSense.`,
        userId: session.user.id
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update site settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
