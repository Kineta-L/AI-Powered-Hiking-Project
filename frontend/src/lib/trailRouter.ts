import { apiFetch } from './api';

interface Coord { lat: number; lng: number; }

export interface TrailRouteResult {
  path: [number, number][];
  engine: 'seed' | 'osrm' | 'waypoints' | 'none';
}

// Get real hiking path. Strategy:
// 1. Seed trail coords (100% real) — set externally by PlannerPage
// 2. OSRM routing (real OSM paths)
// 3. Raw waypoints as dashed estimated line (with warning)
// 4. No path at all (no coords available)


// Detect and trim backtracking (U-turns) from waypoint arrays.
// A backtrack is detected when 3 consecutive points form an angle > 150?
// (meaning the path doubled back on itself).
// Returns trimmed coordinates without the backtracking tail.
function trimBacktracking(coords: [number, number][]): [number, number][] {
  if (coords.length < 3) return coords;

  const result = coords.slice();
  let trimmed = false;

  for (let i = 1; i < result.length - 1; i++) {
    const prev = result[i - 1];
    const curr = result[i];
    const next = result[i + 1];

    // Vectors: prev->curr and curr->next
    const v1x = curr[0] - prev[0];
    const v1y = curr[1] - prev[1];
    const v2x = next[0] - curr[0];
    const v2y = next[1] - curr[1];

    const dot = v1x * v2x + v1y * v2y;
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

    if (mag1 === 0 || mag2 === 0) continue;

    const cosAngle = dot / (mag1 * mag2);
    // cos(150?) ? -0.866, cos(120?) ? -0.5
    // Angle > 150? means strong backtrack
    if (cosAngle < -0.866) {
      console.log('[trailRouter] Backtrack detected at point', i, 'trimming from here');
      return result.slice(0, i + 1);
    }
  }

  return result;
}

export async function getHikingPath(waypoints: Coord[]): Promise<TrailRouteResult> {
  if (waypoints.length < 2) {
    return { path: waypoints.map(w => [w.lng, w.lat]), engine: 'none' };
  }

  console.log('[trailRouter] Getting real path for', waypoints.length, 'waypoints');

  // Try OSRM for real paths in OSM
  try {
    const res = await apiFetch('/api/trails/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypoints }),
    });

    const data = await res.json();

    if (data.success && data.coordinates?.length > 1 && data.engine === 'osrm') {
      console.log('[trailRouter] OSRM real path:', data.coordinates.length, 'coords');
      return { path: data.coordinates, engine: 'osrm' };
    }
    console.log('[trailRouter] No real OSM path found');
  } catch (e) {
    console.error('[trailRouter] OSRM error:', e);
  }

  // Fallback: raw waypoints as estimated line
  console.log('[trailRouter] Using raw waypoints (estimated)');
  const rawPath = waypoints.map(w => [w.lng, w.lat] as [number, number]);
  const cleanPath = trimBacktracking(rawPath);
  if (cleanPath.length < rawPath.length) {
    console.log('[trailRouter] Trimmed backtracking:', rawPath.length, '->', cleanPath.length, 'points');
  }
  return { path: cleanPath, engine: 'waypoints' };
}
