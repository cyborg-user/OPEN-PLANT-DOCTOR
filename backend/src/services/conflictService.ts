import { fetchLiveNews } from './news';

// Static definitions of major geopolitical flashpoints for the arc map visualization
export const HOT_TOPICS = [
  {
    id: 'conflict-1',
    name: 'Middle East Flashpoint',
    actors: ['Israel', 'Iran', 'Lebanon'],
    coordinates: [
      [31.0461, 34.8516], // Israel
      [32.4279, 53.6880], // Iran
    ],
    severity: 'critical',
  },
  {
    id: 'conflict-2',
    name: 'Eastern Europe Front',
    actors: ['Russia', 'Ukraine'],
    coordinates: [
      [55.7558, 37.6173], // Moscow 
      [50.4501, 30.5234], // Kyiv
    ],
    severity: 'critical',
  },
  {
    id: 'conflict-3',
    name: 'South Asian Border',
    actors: ['India', 'Pakistan'],
    coordinates: [
      [28.6139, 77.2090], // New Delhi
      [33.6844, 73.0479], // Islamabad
    ],
    severity: 'high',
  }
];

export async function fetchLiveConflicts() {
  // In a full production app, we would query NewsAPI/GNews specifically for these actors.
  // For the hackathon, we fetch the live global news and filter articles mentioning these actors.
  const allNews = await fetchLiveNews();
  
  const enrichedConflicts = HOT_TOPICS.map(topic => {
    // Find related articles simply by checking if the title or source includes actor names
    const relatedNews = allNews.filter((article: any) => 
      topic.actors.some(actor => 
        article.title.toLowerCase().includes(actor.toLowerCase()) || 
        article.source.toLowerCase().includes(actor.toLowerCase())
      )
    );

    return {
      ...topic,
      recentEvents: relatedNews.slice(0, 3) // Attach top 3 articles
    };
  });

  return enrichedConflicts;
}
