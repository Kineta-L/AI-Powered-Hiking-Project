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
            tiles: ['https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=' + import.meta.env.VITE_THUNDERFOREST_API_KEY],
            tileSize: 256,
            attribution: '© Thunderforest, © OpenStreetMap contributors',
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
    // Fallback: if Thunderforest tiles fail to load, switch to OpenTopoMap
    let tileFailed = false;
    map.on('error', (e: any) => {
      if (e?.tile && !tileFailed) {
        tileFailed = true;
        console.warn('[Map] Thunderforest tile failed, switching to OpenTopoMap');
        const topoSource: any = map.getSource('tf');
        if (topoSource) {
          topoSource.setTiles(['https://tile.opentopomap.org/{z}/{x}/{y}.png']);
          topoSource.setAttribution('© OpenTopoMap');
        }
      }
    });

    // Validate Thunderforest key - if missing, the tile requests will fail.
    // With valid key, Thunderforest Outdoors shows: trails (red dashed), contours, terrain shading
    if (import.meta.env.VITE_THUNDERFOREST_API_KEY && import.meta.env.VITE_THUNDERFOREST_API_KEY.length > 20) {
      console.log('[Map] Using Thunderforest Outdoors');
    } else {
      console.warn('[Map] Thunderforest key missing, map tiles may not load');
    }


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

    const updateRoute = () => {
      const routeCoords = trailPath && trailPath.length > 1
        ? trailPath
        : coordinates.map(c => [c.longitude, c.latitude] as [number, number]);

      if (routeCoords.length < 2) return;

      const source = map.getSource('route-source');
      if (source) {
        (source as maplibregl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: routeCoords },
        });
      }

      // Fit bounds
      if (fitBounds) {
        const bounds = new maplibregl.LngLatBounds();
        routeCoords.forEach(c => bounds.extend(c as [number, number]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
      }
    };

    if (map.isStyleLoaded()) {
      updateRoute();
    } else {
      // Style not loaded yet - wait for it
      const onStyle = () => {
        updateRoute();
        map.off('style.load', onStyle);
      };
      map.on('style.load', onStyle);
      return () => { map.off('style.load', onStyle); };
    }
        // Update line styles based on route quality
      const isEstimated = routeQuality === 'waypoints';
      ['route-glow', 'route-outline', 'route-line'].forEach(layerId => {
        const layer = map.getLayer(layerId);
        if (!layer) return;
        if (isEstimated) {
          if (layerId === 'route-glow') {
            map.setPaintProperty(layerId, 'line-color', '#6b7280');
            map.setPaintProperty(layerId, 'line-opacity', 0.08);
            map.setPaintProperty(layerId, 'line-blur', 2);
          } else if (layerId === 'route-outline') {
            map.setPaintProperty(layerId, 'line-color', '#9ca3af');
            map.setPaintProperty(layerId, 'line-opacity', 0.3);
          } else if (layerId === 'route-line') {
            map.setPaintProperty(layerId, 'line-color', '#6b7280');
            map.setPaintProperty(layerId, 'line-width', 2.5);
            map.setPaintProperty(layerId, 'line-opacity', 0.7);
            map.setPaintProperty(layerId, 'line-dasharray', [5, 3]);
          }
        } else {
          if (layerId === 'route-glow') {
            map.setPaintProperty(layerId, 'line-color', '#ff2d78');
            map.setPaintProperty(layerId, 'line-opacity', 0.15);
            map.setPaintProperty(layerId, 'line-blur', 3);
          } else if (layerId === 'route-outline') {
            map.setPaintProperty(layerId, 'line-color', '#fff');
            map.setPaintProperty(layerId, 'line-opacity', 0.4);
          } else if (layerId === 'route-line') {
            map.setPaintProperty(layerId, 'line-color', '#ff2d78');
            map.setPaintProperty(layerId, 'line-width', 3);
            map.setPaintProperty(layerId, 'line-opacity', 1);
            map.setPaintProperty(layerId, 'line-dasharray', undefined as any);
          }
        }
      });

      // Show/hide warning label
      const existingWarning = document.getElementById('route-quality-warning');
      if (isEstimated) {
        if (!existingWarning) {
          const warning = document.createElement('div');
          warning.id = 'route-quality-warning';
          warning.style.cssText = 'position:absolute;bottom:10px;left:10px;background:rgba(107,114,128,0.9);color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:500;z-index:2;pointer-events:none;font-family:Inter,PingFang SC,sans-serif';
          warning.textContent = '⚠️ 非真实路线，仅供参考';
          map.getContainer().appendChild(warning);
        }
      } else {
        if (existingWarning) existingWarning.remove();
      }
    }, [trailPath, coordinates, fitBounds, routeQuality]);

  // Center map when coordinates change (even single point)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || coordinates.length === 0) return;
    
    // If only one coordinate, fly to it
    if (coordinates.length === 1 && (!trailPath || trailPath.length < 2)) {
      map.flyTo({ center: [coordinates[0].longitude, coordinates[0].latitude], zoom: 13 });
    }
  }, [coordinates, trailPath]);


  // Update fit button click handler
  useEffect(() => {
    const map = mapInstance.current;
    const btn = fitBtnRef.current;
    if (!map || !btn) return;

    const handler = () => {
      const routeCoords = trailPath && trailPath.length > 1
        ? trailPath
        : coordinates.map(c => [c.longitude, c.latitude] as [number, number]);
      if (routeCoords.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        routeCoords.forEach(c => bounds.extend(c as [number, number]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
      } else if (coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        coordinates.forEach(c => bounds.extend([c.longitude, c.latitude]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
      }
    };
    btn.onclick = handler;
  }, [trailPath, coordinates]);

  // Manage start/end markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const updateMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!showMarkers) return;

    const routeCoords = trailPath && trailPath.length > 1
      ? trailPath
      : coordinates.map(c => [c.longitude, c.latitude] as [number, number]);

    if (routeCoords.length < 2) return;

    // START marker
    const startCoord = routeCoords[0];
    const startEl = document.createElement('div');
    const ss = 'display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)';
    const sb = 'background:#22c55e;color:#fff;padding:5px 12px;border-radius:8px;font-size:14px;font-weight:700;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.6);font-family:Inter,PingFang SC,sans-serif';
    const st = 'width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #22c55e';
    startEl.innerHTML = '<div style="' + ss + '"><div style="' + sb + '">\ud83d\udea9 \u8d77\u70b9</div><div style="' + st + '"></div></div>';
    const startMarker = new maplibregl.Marker({ element: startEl, anchor: 'bottom' })
      .setLngLat(startCoord as [number, number])
      .addTo(map);
    markersRef.current.push(startMarker);

    // END marker
    const lastCoord = routeCoords[routeCoords.length - 1];
    const endEl = document.createElement('div');
    const eb = 'background:#ef4444;color:#fff;padding:5px 12px;border-radius:8px;font-size:14px;font-weight:700;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.6);font-family:Inter,PingFang SC,sans-serif';
    const et = 'width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #ef4444';
    endEl.innerHTML = '<div style="' + ss + '"><div style="' + eb + '">\ud83c\udfc1 \u7ec8\u70b9</div><div style="' + et + '"></div></div>';
    const endMarker = new maplibregl.Marker({ element: endEl, anchor: 'bottom' })
      .setLngLat(lastCoord as [number, number])
      .addTo(map);
    markersRef.current.push(endMarker);

    // Day markers
    if (showDayMarkers && totalDays && totalDays > 1 && coordinates.length > 2) {
      const midPoints = coordinates.filter((_, i) => i > 0 && i < coordinates.length - 1);
      const maxDayMarkers = totalDays - 1;
      const pointsToShow = midPoints.slice(0, maxDayMarkers);

      pointsToShow.forEach((wp, di) => {
        const dayNum = di + 1;
        // Snap to nearest point on route
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let ti = 0; ti < routeCoords.length; ti++) {
          const dx = routeCoords[ti][0] - wp.longitude;
          const dy = routeCoords[ti][1] - wp.latitude;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) { bestDist = dist; bestIdx = ti; }
        }
        const snapCoord = routeCoords[bestIdx];

        const del = document.createElement('div');
        const ds = 'display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)';
        const db = 'background:#1f2937;color:#fbbf24;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.6);font-family:Inter,PingFang SC,sans-serif;border:1.5px solid #fbbf24';
        const dt = 'width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #fbbf24';
        del.innerHTML = '<div style="' + ds + '"><div style="' + db + '">Day ' + dayNum + '</div><div style="' + dt + '"></div></div>';
        const dayMarker = new maplibregl.Marker({ element: del, anchor: 'bottom' })
          .setLngLat(snapCoord as [number, number])
          .addTo(map);
        markersRef.current.push(dayMarker);
      });
    }

    // Fit bounds after adding markers
    if (fitBounds && routeCoords.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      routeCoords.forEach(c => bounds.extend(c as [number, number]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    }
    }; // end updateMarkers

    if (map.isStyleLoaded()) {
      updateMarkers();
    } else {
      const onStyle = () => {
        updateMarkers();
        map.off('style.load', onStyle);
      };
      map.on('style.load', onStyle);
      return () => { map.off('style.load', onStyle); };
    }
  }, [showMarkers, showDayMarkers, trailPath, coordinates, totalDays, fitBounds]);

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