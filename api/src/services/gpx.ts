import { parseStringPromise } from 'xml2js';

interface GPXWaypoint {
  lat: number;
  lon: number;
  ele?: number;
  name?: string;
  time?: string;
}

interface GPXTrackPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: string;
}

interface ParsedGPX {
  waypoints: GPXWaypoint[];
  trackPoints: GPXTrackPoint[];
  name?: string;
  totalDistance?: number;
  elevationGain?: number;
  elevationLoss?: number;
}

export async function parseGPX(xmlContent: string): Promise<ParsedGPX> {
  const result = await parseStringPromise(xmlContent);
  const gpx = result.gpx;

  const waypoints: GPXWaypoint[] = [];
  if (gpx.wpt) {
    for (const wpt of gpx.wpt) {
      waypoints.push({
        lat: parseFloat(wpt.$.lat),
        lon: parseFloat(wpt.$.lon),
        ele: wpt.ele ? parseFloat(wpt.ele[0]) : undefined,
        name: wpt.name?.[0],
        time: wpt.time?.[0],
      });
    }
  }

  const trackPoints: GPXTrackPoint[] = [];
  if (gpx.trk) {
    for (const trk of gpx.trk) {
      if (trk.trkseg) {
        for (const seg of trk.trkseg) {
          if (seg.trkpt) {
            for (const pt of seg.trkpt) {
              trackPoints.push({
                lat: parseFloat(pt.$.lat),
                lon: parseFloat(pt.$.lon),
                ele: pt.ele ? parseFloat(pt.ele[0]) : undefined,
                time: pt.time?.[0],
              });
            }
          }
        }
      }
    }
  }

  // Also check rte (route) points
  if (gpx.rte && !trackPoints.length) {
    for (const rte of gpx.rte) {
      if (rte.rtept) {
        for (const pt of rte.rtept) {
          trackPoints.push({
            lat: parseFloat(pt.$.lat),
            lon: parseFloat(pt.$.lon),
            ele: pt.ele ? parseFloat(pt.ele[0]) : undefined,
            time: pt.time?.[0],
          });
        }
      }
    }
  }

  const name = gpx.metadata?.[0]?.name?.[0] || gpx.trk?.[0]?.name?.[0];

  // Calculate distance using Haversine
  let totalDistance = 0;
  for (let i = 1; i < trackPoints.length; i++) {
    totalDistance += haversineDistance(
      trackPoints[i - 1].lat, trackPoints[i - 1].lon,
      trackPoints[i].lat, trackPoints[i].lon
    );
  }

  // Calculate elevation gain/loss
  let elevationGain = 0;
  let elevationLoss = 0;
  for (let i = 1; i < trackPoints.length; i++) {
    if (trackPoints[i].ele != null && trackPoints[i - 1].ele != null) {
      const diff = trackPoints[i].ele! - trackPoints[i - 1].ele!;
      if (diff > 0) elevationGain += diff;
      else elevationLoss += Math.abs(diff);
    }
  }

  return {
    waypoints,
    trackPoints,
    name,
    totalDistance: Math.round(totalDistance * 100) / 100,
    elevationGain: Math.round(elevationGain),
    elevationLoss: Math.round(elevationLoss),
  };
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
