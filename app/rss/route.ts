import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Fetch recent public published posts
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  const siteTitle = 'Ruang Berpikir Kadalio — RSS Feed';
  const siteDescription = 'Eksplorasi teknologi modern, catatan perjalanan pengembangan perangkat lunak, dan dokumentasi visual Kadalio.';
  const lastBuildDate = posts.length > 0 ? new Date(posts[0].createdAt).toUTCString() : new Date().toUTCString();

  const rssItems = posts
    .map((post: any) => {
      const postUrl = `${baseUrl}/post/${post.slug}`;
      const authorName = post.user?.name || 'Kadalio';
      const pubDate = new Date(post.createdAt).toUTCString();
      
      // Clean up markdown / special characters for brief summary in description
      const summary = post.content
        .replace(/[#*`_\[\]]/g, '')
        .substring(0, 300)
        .trim() + '...';

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${authorName}</author>
      <category><![CDATA[${post.category || 'Teknologi'}]]></category>
      <description><![CDATA[${summary}]]></description>
    </item>`;
    })
    .join('');

  const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>id-ID</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
    <generator>Kadalio Next.js RSS Generator</generator>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(xmlFeed.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
