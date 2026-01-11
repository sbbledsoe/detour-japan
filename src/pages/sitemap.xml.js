import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const site = context.site.href;

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: 'about/', priority: '0.8', changefreq: 'monthly' },
  ];

  const postEntries = posts
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => ({
      url: `posts/${post.slug}/`,
      lastmod: post.data.pubDate.toISOString().split('T')[0],
      priority: '0.7',
      changefreq: 'monthly'
    }));

  const allPages = [...staticPages, ...postEntries];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${site}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
