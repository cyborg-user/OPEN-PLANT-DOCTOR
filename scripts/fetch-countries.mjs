import fs from 'fs';

(async () => {
  try {
    console.log('Fetching restcountries...');
    const res = await fetch('https://restcountries.com/v3.1/all');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    
    // The 20 countries already manually configured in dashboard-data.ts
    const existingCodes = ['UA', 'SY', 'SD', 'YE', 'MM', 'IR', 'RU', 'CN', 'IN', 'BR', 'NG', 'TR', 'US', 'GB', 'DE', 'JP', 'AU', 'TW', 'PK', 'SO'];
    
    // Filter out existing and micro-nations
    const newCountries = json.filter(c => c.cca2 && !existingCodes.includes(c.cca2) && c.latlng && c.latlng.length === 2 && c.population > 500000);
    
    const mapped = newCountries.map(c => {
      return {
        name: c.name.common,
        code: c.cca2,
        flag: c.flag || '🏳️',
        lat: c.latlng[0],
        lng: c.latlng[1],
        riskLevel: 'low',
        riskScore: Math.floor(Math.random() * 15) + 5, // Baseline low risk 5-20
        weather: {
          temp: Math.floor(Math.random() * 30) + 5,
          condition: 'Clear',
          humidity: Math.floor(Math.random() * 50) + 30,
          wind: Math.floor(Math.random() * 20) + 5
        },
        disasters: [],
        conflictActive: false,
        goldIndicator: 2850 + Math.floor(Math.random() * 20) - 10,
        flightDensity: Math.floor(Math.random() * 300) + 10,
        wildfireDetections: 0,
        marketData: Array.from({length: 12}, () => Math.floor(Math.random() * 30) + 10),
        population: (c.population / 1000000).toFixed(1) + 'M',
        region: c.region || 'Unknown'
      };
    });

    const fileContent = `// Auto-generated fallback list of all remaining global nations
import type { Country } from './dashboard-data';

export const globalCountries: Country[] = ${JSON.stringify(mapped, null, 2)};
    `;
    
    fs.writeFileSync('frontend/lib/global-countries.ts', fileContent.trim());
    console.log('Saved ' + mapped.length + ' countries to global-countries.ts!');
  } catch (e) {
    console.error('Failed', e);
  }
})();
