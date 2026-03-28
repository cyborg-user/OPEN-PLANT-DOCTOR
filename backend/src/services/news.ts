import Parser from 'rss-parser';

const parser = new Parser();

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export async function fetchLiveNews(): Promise<NewsItem[]> {
  const feedsToTry = [
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', name: 'Google News' },
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' }
  ];

  for (const feedConfig of feedsToTry) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items && feed.items.length > 0) {
        return feed.items.slice(0, 15).map((item, index) => ({
          id: `news-${index}-${Date.now()}`,
          title: item.title || 'Untitled',
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          source: item.source || feedConfig.name,
        }));
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${feedConfig.name}, trying next fallback...`);
    }
  }

  console.error('All live news RSS feeds failed. Returning empty list.');
  return [];
}
