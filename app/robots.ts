import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Daftar lengkap bot & crawler pelatihan AI untuk diblokir total
  const aiBots = [
    'GPTBot',
    'ChatGPT-User',
    'Google-Extended',
    'CCBot',
    'Anthropic-ai',
    'ClaudeBot',
    'Claude-Web',
    'FacebookBot',
    'Meta-ExternalAgent',
    'Bytespider',
    'Amazonbot',
    'PerplexityBot',
    'Omgilibot',
    'Omgili',
    'Diffbot',
    'Applebot-Extended',
    'YouBot',
    'Coherence',
    'ImagesiftBot',
    'NewsGuard',
    'Scrapy',
    'TurnitinBot',
    'AI2Bot',
    'Ai2Bot-Dolma',
    'DataForSeoBot',
    'TimpiBot',
    'Timpibot',
    'VelenPublicWebCrawler',
    'Webz.io',
    'iaskspider/2.0',
    'Crawlspace',
  ];

  const aiBotRules = aiBots.map((bot: any) => ({
    userAgent: bot,
    disallow: '/',
  }));

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/login/', '/api/'],
      },
      ...aiBotRules,
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
