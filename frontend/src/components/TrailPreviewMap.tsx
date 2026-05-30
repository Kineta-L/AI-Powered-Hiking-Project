import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { getTrailCoverImage, getTrailDisplayPath, type TrailPathSource } from '../lib/knownTrailPaths';
import { getHikingPath } from '../lib/trailRouter';

interface TrailPreviewMapProps {
  trail: TrailPathSource;
}

function buildPolyline(path: [number, number][]) {
  if (path.length < 2) return '';

  const lngs = path.map(p => p[0]);
  const lats = path.map(p => p[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const lngSpan = maxLng - minLng || 1;
  const latSpan = maxLat - minLat || 1;
  const padding = 18;
  const width = 360 - padding * 2;
  const height = 160 - padding * 2;

  return path.map(([lng, lat]) => {
    const x = padding + ((lng - minLng) / lngSpan) * width;
    const y = padding + (1 - (lat - minLat) / latSpan) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export default function TrailPreviewMap({ trail }: TrailPreviewMapProps) {
  const [detailTrail, setDetailTrail] = useState<TrailPathSource | null>(null);
  const displayTrail = detailTrail || trail;
  const basePath = useMemo(() => getTrailDisplayPath(displayTrail), [displayTrail]);
  const [routedPath, setRoutedPath] = useState<[number, number][] | null>(null);
  const [routingTried, setRoutingTried] = useState(false);
  const path = routedPath || basePath;
  const coverImage = getTrailCoverImage(displayTrail);
  const points = buildPolyline(path);
  const sparseUnverified = basePath.length > 1 && path.length < 20;
  const shouldDrawLine = !!points && path.length >= 20;
  const previewPoints = points ? points.trim().split(/\s+/) : [];

  useEffect(() => {
    let cancelled = false;
    setRoutedPath(null);
    setRoutingTried(false);

    if (!displayTrail.coordinates || basePath.length < 2 || basePath.length >= 20) return;

    getHikingPath(displayTrail.coordinates.map(c => ({ lat: c.latitude, lng: c.longitude })))
      .then(result => {
        if (!cancelled && result.engine === 'osrm' && result.path.length > basePath.length) {
          setRoutedPath(result.path);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setRoutingTried(true);
      });

    return () => { cancelled = true; };
  }, [displayTrail, basePath]);

  useEffect(() => {
    let cancelled = false;
    setDetailTrail(null);

    if (trail.coordinates?.length || !trail.id) return;

    apiFetch(`/api/trails/${trail.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data?.coordinates?.length) setDetailTrail(data);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [trail.id, trail.coordinates]);

  return (
    <div className="h-44 relative overflow-hidden bg-[#18231f]">
      <img src={coverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/35" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 160" role="img" aria-label="Trail route preview">
        <defs>
          <pattern id="trail-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="360" height="160" fill="url(#trail-grid)" opacity="0.45" />
        {points ? (
          <>
            {shouldDrawLine && (
              <>
                <polyline points={points} fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={points} fill="none" stroke="#ff2d78" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
            {sparseUnverified && previewPoints.map((point, index) => {
              const [x, y] = point.split(',');
              return <circle key={`${point}-${index}`} cx={x} cy={y} r={index === 0 || index === previewPoints.length - 1 ? 4 : 2.5} fill={index === 0 ? '#22c55e' : index === previewPoints.length - 1 ? '#f97316' : '#ff2d78'} stroke="white" strokeWidth="1" />;
            })}
            <circle cx={previewPoints[0]?.split(',')[0]} cy={previewPoints[0]?.split(',')[1]} r="4" fill="#22c55e" stroke="white" strokeWidth="1.5" />
            <circle cx={previewPoints.at(-1)?.split(',')[0]} cy={previewPoints.at(-1)?.split(',')[1]} r="4" fill="#f97316" stroke="white" strokeWidth="1.5" />
          </>
        ) : (
          <text x="180" y="82" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="13">No GPX</text>
        )}
      </svg>
      {sparseUnverified && (
        <div className="absolute right-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[11px] text-amber-200 border border-amber-400/20">
          {routingTried ? '简化点位' : '匹配路网...'}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
    </div>
  );
}
