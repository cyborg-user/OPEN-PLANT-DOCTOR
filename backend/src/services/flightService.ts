import axios from 'axios';

// Cache flights for 60 seconds to avoid aggressive rate limiting
let cachedFlights: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000;

export async function fetchLiveFlights() {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION && cachedFlights.length > 0) {
    return cachedFlights;
  }

  try {
    // We fetch all flights over a specific bounding box or globally.
    // Global fetch is massive, so we take a large bounding box (e.g. Europe + NA, or all).
    // The public API without auth has strict rate limits.
    const response = await axios.get('https://opensky-network.org/api/states/all');
    
    // response.data.states is an array of arrays representing flights
    const states = response.data.states || [];
    
    // We slice to a manageable number for UI performance (e.g., top 500 flights active right now)
    const activeFlights = states
      .filter((state: any[]) => state[5] && state[6] && !state[8]) // Must have lng, lat, and not be on ground
      .slice(0, 500)
      .map((state: any[]) => ({
        id: state[0], // icao24
        callsign: state[1] ? state[1].trim() : 'UNKNOWN',
        origin: state[2],
        longitude: state[5],
        latitude: state[6],
        altitude: state[7] || 0, // baro_altitude
        velocity: state[9] || 0, // m/s
        true_track: state[10] || 0, // degrees
      }));

    cachedFlights = activeFlights;
    lastFetchTime = now;
    return activeFlights;
  } catch (error) {
    console.error('Error fetching OpenSky Flight Data:', error);
    // If rate limited, return cached baseline
    return cachedFlights;
  }
}
