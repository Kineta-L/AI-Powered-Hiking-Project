import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';

interface Coordinate {
  latitude: number;
  longitude: number;
  elevation?: number | null;
  name?: string;
}

interface MapContainerProps {
  coordinates: Coordinate[];
  interactive?: boolean;
  className?: string;
  fitBounds?: boolean;
  trailPath?: [number, number][];
  totalDays?: number;
  showDayMarkers?: boolean;
  showMarkers?: boolean;
  routeQuality?: 'seed' | 'osrm' | 'waypoints' | 'none';
}

export default function MapContainer({
  coordinates,
  interactive = true,
  className,
  fitBounds = true,
  trailPath,
  totalDays,
  showDayMarkers = false,
  showMarkers = false,
  routeQuality = 'none',
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const fitBtnRef = useRef<HTMLDivElement | null>(null);

  // Create map once on mount
  useEffect(() => {
    if (!mapRef.current) return;

    const center: [number, number] = coordinates.length > 0
      ? [coordinates[0].longitude, coordinates[0].latitude]
      : [104, 30];

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          tf: {
            type: 'raster',
            tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenTopoMap, © OpenStreetMap contributors',
          },
        },
        layers: [
          { id: 'tf-layer', type: 'raster', source: 'tf' },
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      } as any,
      center,
      zoom: 12,
      scrollZoom: true,
      doubleClickZoom: true,
      dragPan: true,
      interactive,
      maxZoom: 17,
      minZoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    console.log('[Map] Using OpenTopoMap');

    // Fit-to-route button
    const fitBtn = document.createElement('div');
    fitBtn.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    fitBtn.innerHTML = '<button style="font-size:16px;line-height:1" title="Fit to route">\ud83d\uddfa</button>';
    fitBtnRef.current = fitBtn;
    const topRight = map.getContainer().querySelector('.maplibregl-ctrl-top-right');
    if (topRight) topRight.appendChild(fitBtn);

    map.on('load', () => {
      // Add empty route source (will be populated later)
      map.addSource('route-source', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });

      // Glow layer
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ff2d78', 'line-width': 8, 'line-opacity': 0.15, 'line-blur': 3 },
      });
      // White outline
      map.addLayer({
        id: 'route-outline',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#fff', 'line-width': 4, 'line-opacity': 0.4 },
      });
      // Main route line
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ff2d78', 'line-width': 3, 'line-opacity': 1 },
      });
    });

    mapInstance.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []); // Only create map once

  // Update route source when trailPath or coordinates change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const applyRoute = () => {
      const isRealRoute = routeQuality === 'seed' || routeQuality === 'osrm';
      const src = map.getSource('route-source');
      if (!src) return;

      if (!isRealRoute || !trailPath || trailPath.length < 2) {
        // Clear any route drawing - no line for non-real routes
        (src as maplibregl.GeoJSONSource).setData({
          type: 'Feature', properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        });
        // Remove warning
        const w = document.getElementById('route-quality-warning');
        if (w) w.remove();
        return;
      }

      // Draw real route
      (src as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: trailPath },
      });

      // Fit bounds
      if (fitBounds) {
        const bounds = new maplibregl.LngLatBounds();
        trailPath.forEach(c => bounds.extend(c as [number, number]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
      }
    };

    if (map.isStyleLoaded()) {
      applyRoute();
    } else {
      const onStyle = () => { applyRoute(); map.off('style.load', onStyle); };
      map.on('style.load', onStyle);
      return () => { map.off('style.load', onStyle); };
    }
  }, [trailPath, routeQuality, fitBounds]);

  // Handle interactive toggle
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (interactive) {
      map.scrollZoom.enable();
      map.dragPan.enable();
      map.doubleClickZoom.enable();
    } else {
      map.scrollZoom.disable();
      map.dragPan.disable();
      map.doubleClickZoom.disable();
    }
  }, [interactive]);

  return <div ref={mapRef} className={className || 'w-full h-full'} />;
}