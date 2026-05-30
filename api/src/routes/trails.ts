import { Router, Request, Response } from 'express';
import { prisma } from '../server';
import { parseGPX } from '../services/gpx';
import { standardizeDifficulty, standardizeTrailForResponse, trailMatchesFilters, trailMatchesSearch } from '../utils/trailStandardization';

export const trailsRouter = Router();

// GET /api/trails — list trails with filters & search
trailsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { region, difficulty, season, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 20));
    const skip = (currentPage - 1) * pageSize;

    const allTrails = await prisma.trail.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        coordinates: { orderBy: { order: 'asc' }, select: { latitude: true, longitude: true } },
        _count: { select: { reviews: true, favorites: true } },
      },
    });

    const filtered = allTrails
      .filter(trail => trailMatchesSearch(trail, search))
      .filter(trail => trailMatchesFilters(trail, { region, difficulty, season }))
      .map(standardizeTrailForResponse);

    res.json({
      trails: filtered.slice(skip, skip + pageSize),
      total: filtered.length,
      page: currentPage,
      totalPages: Math.ceil(filtered.length / pageSize),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trails' });
  }
});

// POST /api/trails/route -- hiking trail routing
// Strategy: single OSRM call with all waypoints, validate, fallback to waypoints
trailsRouter.post('/route', async (req: Request, res: Response) => {
  try {
    const { waypoints } = req.body;
    if (!waypoints || waypoints.length < 2) {
      return res.status(400).json({ error: 'At least 2 waypoints required' });
    }

    const wp = waypoints as { lng: number; lat: number }[];
    console.log('[Route] Routing', wp.length, 'waypoints');

    // Single OSRM call with all waypoints as via points
    const coordsStr = wp.map(w => w.lng + ',' + w.lat).join(';');
    const url = 'https://router.project-osrm.org/route/v1/foot/' + coordsStr +
      '?geometries=geojson&overview=full&alternatives=false&steps=true';

    try {
      const osrmRes = await fetch(url);
      const data: any = await osrmRes.json();

      if (data.code === 'Ok' && data.routes?.length > 0) {
        const osrmCoords: [number, number][] = data.routes[0].geometry.coordinates;
        const osrmDist = data.routes[0].distance;

        // Validate: check that OSRM path passes near each waypoint
        let maxDev = 0;
        let allNear = true;
        for (const w of wp) {
          let minD = Infinity;
          // Sample OSRM path (check every 50th point for performance)
          for (let j = 0; j < osrmCoords.length; j += 50) {
            const dx = (osrmCoords[j][0] - w.lng) * 111000 * Math.cos(w.lat * Math.PI / 180);
            const dy = (osrmCoords[j][1] - w.lat) * 111000;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < minD) minD = d;
          }
          if (minD > maxDev) maxDev = minD;
          if (minD > 5000) allNear = false;
        }

        console.log('[Route] OSRM:', osrmCoords.length, 'coords,', (osrmDist/1000).toFixed(1), 'km, max dev', Math.round(maxDev), 'm, allNear:', allNear);

        if (allNear) {
          // OSRM path follows the waypoints closely -- real trail!
          return res.json({ success: true, coordinates: osrmCoords, distance: osrmDist, duration: 0, engine: 'osrm' });
        }

        // OSRM path deviates too much, fall through to waypoints
        console.warn('[Route] OSRM path deviates', Math.round(maxDev), 'm from waypoints, falling back to AI');
      } else {
        console.warn('[Route] OSRM returned:', data.code, data.message || '');
      }
    } catch (e: any) {
      console.warn('[Route] OSRM error:', e.message);
    }

    // Fallback: OSRM can't find trail path
    // Return waypoints as-is (frontend will smooth them)
    // These trace the AI's best estimate of the trail shape
    console.log('[Route] Using AI waypoints (trail not in OSM)');
    const wpCoords: [number, number][] = wp.map(w => [w.lng, w.lat]);
    return res.json({ success: true, coordinates: wpCoords, distance: 0, duration: 0, engine: 'waypoints' });

  } catch (error: any) {
    console.error('[Route] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trails/upload - upload trail with GPX
trailsRouter.post('/upload', async (req: Request, res: Response) => {
  try {
    const { titleZh, titleEn, descriptionZh, descriptionEn, difficulty, region, country,
      authorId, gpxData } = req.body;

    if (!gpxData || typeof gpxData !== 'string') {
      return res.status(400).json({ error: 'GPX data is required' });
    }

    const parsed = await parseGPX(gpxData);
    if (parsed.trackPoints.length < 2) {
      return res.status(400).json({ error: 'GPX must include at least 2 track or route points' });
    }

    const trailTitle = titleZh?.trim() || parsed.name || 'Uploaded GPX Trail';
    const coordinates = parsed.trackPoints.map((point, index) => ({
      latitude: point.lat,
      longitude: point.lon,
      elevation: point.ele,
      order: index,
    }));

    const trail = await prisma.trail.create({
      data: {
        titleZh: trailTitle,
        titleEn,
        descriptionZh,
        descriptionEn,
        difficulty: standardizeDifficulty(difficulty),
        distance: parsed.totalDistance,
        elevationGain: parsed.elevationGain,
        duration: 1,
        region: region?.trim() || null,
        country: country?.trim() || null,
        authorId,
        status: 'user',
        coordinates: { create: coordinates },
        days: {
          create: [{
            dayNumber: 1,
            titleZh: trailTitle,
            titleEn: titleEn || parsed.name,
            description: descriptionZh || descriptionEn || null,
            distance: parsed.totalDistance,
            elevation: parsed.elevationGain,
            highlights: parsed.waypoints.map(w => w.name).filter(Boolean).join(', ') || null,
          }],
        },
        gpxTrack: {
          create: {
            rawData: gpxData,
            waypoints: parsed.waypoints.length ? JSON.stringify(parsed.waypoints) : null,
          },
        },
      },
      include: { days: true, coordinates: true, gpxTrack: true },
    });

    res.status(201).json(trail);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Failed to upload trail' });
  }
});

// GET /api/trails/:id// GET /api/trails/:id// GET /api/trails/:id// Decode Valhalla encoded polyline6
function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coords.push([lng * 1e-6, lat * 1e-6]);
  }
  return coords;
}

// GET /api/trails/:id — trail detail
trailsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const trail = await prisma.trail.findUnique({
      where: { id: req.params.id as string },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        days: { orderBy: { dayNumber: 'asc' } },
        coordinates: { orderBy: { order: 'asc' } },
        gpxTrack: true,
        reviews: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { favorites: true } },
      },
    });

    if (!trail) {
      return res.status(404).json({ error: 'Trail not found' });
    }

    res.json(standardizeTrailForResponse(trail));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trail' });
  }
});

// POST /api/trails — create trail
trailsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { titleZh, titleEn, descriptionZh, descriptionEn, difficulty, distance, elevationGain,
      duration, season, region, country, coverImage, authorId, days, coordinates } = req.body;

    const trail = await prisma.trail.create({
      data: {
        titleZh,
        titleEn,
        descriptionZh,
        descriptionEn,
        difficulty: standardizeDifficulty(difficulty),
        distance,
        elevationGain,
        duration,
        season,
        region: region?.trim() || null,
        country: country?.trim() || null,
        coverImage,
        authorId,
        status: authorId ? 'user' : 'seed',
        days: days ? {
          create: days.map((d: any) => ({
            dayNumber: d.dayNumber,
            titleZh: d.titleZh,
            titleEn: d.titleEn,
            description: d.description,
            distance: d.distance,
            elevation: d.elevation,
            highlights: d.highlights,
          })),
        } : undefined,
        coordinates: coordinates ? {
          create: coordinates.map((c: any, i: number) => ({
            latitude: c.latitude,
            longitude: c.longitude,
            elevation: c.elevation,
            order: i,
          })),
        } : undefined,
      },
      include: { days: true, coordinates: true },
    });

    res.status(201).json(trail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create trail' });
  }
});

// POST /api/trails/upload — upload trail with GPX
