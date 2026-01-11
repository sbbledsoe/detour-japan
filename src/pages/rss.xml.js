import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);

  return rss({
    title: 'Detour Japan',
    description: 'Discover the Japan tourists miss - hidden gems, off-the-beaten-path destinations, and authentic travel experiences across Japan\'s 47 prefectures.',
    site: context.site,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/posts/${post.slug}/`,
        categories: post.data.tags,
        customData: `<prefecture>${post.data.prefecture}</prefecture>`,
      })),
    customData: `<language>en-us</language>`,
  });
}
