interface Coord { lat: number; lng: number; }

// Get real hiking path. Strategy:
// 1. Seed trail coords (100% real) already used directly by TrailDetailPage
// 2. OSRM routing (real OSM paths)
// 3. Raw waypoints as straight segments (honest: shows we can't find trail)

export async function getHikingPath(waypoints: Coord[]): Promise<[number, number][]> {
  if (waypoints.length < 2) return waypoints.map(w => [w.lng, w.lat]);

  console.log('[trailRouter] Getting real path for', waypoints.length, 'waypoints');

  // Try OSRM for real paths in OSM
  try {
    const res = await fetch('/api/trails/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypoints }),
    });

    const data = await res.json();

    if (data.success && data.coordinates?.length > 1 && data.engine === 'osrm') {
      console.log('[trailRouter] OSRM real path:', data.coordinates.length, 'coords');
      return data.coordinates;
    }
    console.log('[trailRouter] No real OSM path found');
  } catch (e) {
    console.error('[trailRouter] OSRM error:', e);
  }

  // Fallback: raw waypoints as straight segments (honest, not fake)
  console.log('[trailRouter] Using raw waypoints (honest fallback)');
  return waypoints.map(w => [w.lng, w.lat]);
}
