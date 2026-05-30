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

type MapMode = 'outdoor' | 'topo' | 'clean';

const thunderforestKey = import.meta.env.VITE_THUNDERFOREST_API_KEY;
const hasThunderforestKey = thunderforestKey && !thunderforestKey.startsWith('your_');

const getRasterStyle = (mode: MapMode) => {
  const config = {
    outdoor: {
      tiles: hasThunderforestKey
        ? [`https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${thunderforestKey}`]
        : ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
      attribution: hasThunderforestKey
        ? '© Thunderforest, © OpenStreetMap contributors'
        : '© CARTO, © OpenStreetMap contributors',
    },
    topo: {
      tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
      attribution: '© OpenTopoMap, © OpenStreetMap contributors',
    },
    clean: {
      tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
      attribution: '© CARTO, © OpenStreetMap contributors',
    },
  }[mode];

  return {
    version: 8,
    sources: {
      basemap: {
        type: 'raster',
        tiles: config.tiles,
        tileSize: 256,
        attribution: config.attribution,
      },
    },
    layers: [
      { id: 'basemap-layer', type: 'raster', source: 'basemap' },
    ],
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  } as any;
};

export default function MapContainer({
  coordinates,
  interactive = true,
  className,
  fitBounds = true,
  trailPath,
  routeQuality = 'none',
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const trailPathRef = useRef<[number, number][] | undefined>(trailPath);
  const routeQualityRef = useRef(routeQuality);
  const fitBoundsRef = useRef(fitBounds);

  const ensureRouteLayers = (map: maplibregl.Map) => {
    if (!map.getSource('route-source')) {
      map.addSource('route-source', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });
    }

    if (!map.getLayer('route-glow')) {
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ff2d78', 'line-width': 8, 'line-opacity': 0.15, 'line-blur': 3 },
      });
    }

    if (!map.getLayer('route-outline')) {
      map.addLayer({
        id: 'route-outline',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#fff', 'line-width': 4, 'line-opacity': 0.45 },
      });
    }

    if (!map.getLayer('route-line')) {
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ff2d78', 'line-width': 3.5, 'line-opacity': 1 },
      });
    }
  };

  const applyRoute = (map: maplibregl.Map) => {
    ensureRouteLayers(map);
    const source = map.getSource('route-source');
    if (!source) return;

    const isRealRoute = routeQualityRef.current === 'seed' || routeQualityRef.current === 'osrm';
    if (!isRealRoute || !trailPathRef.current || trailPathRef.current.length < 2) {
      (source as maplibregl.GeoJSONSource).setData({
        type: 'Feature', properties: {},
        geometry: { type: 'LineString', coordinates: [] },
      });
      return;
    }

    (source as maplibregl.GeoJSONSource).setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: trailPathRef.current },
    });

    if (fitBoundsRef.current) {
      const bounds = new maplibregl.LngLatBounds();
      trailPathRef.current.forEach(c => bounds.extend(c as [number, number]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const center: [number, number] = coordinates.length > 0
      ? [coordinates[0].longitude, coordinates[0].latitude]
      : [104, 30];

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: getRasterStyle('outdoor'),
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
    console.log('[Map] Using hiking outdoor basemap');

    const topRight = map.getContainer().querySelector('.maplibregl-ctrl-top-right');

    const fitBtn = document.createElement('div');
    fitBtn.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    fitBtn.innerHTML = '<button style="width:34px;height:34px;font-size:16px;line-height:1" title="Fit to route">\ud83d\uddfa</button>';
    if (topRight) topRight.appendChild(fitBtn);

    const layerControl = document.createElement('div');
    layerControl.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    layerControl.style.display = 'flex';
    layerControl.style.flexDirection = 'row';
    layerControl.style.overflow = 'hidden';
    layerControl.innerHTML = [
      ['outdoor', '\u5f92\u6b65'],
      ['topo', '\u5730\u5f62'],
      ['clean', '\u6e05\u723d'],
    ].map(([mode, label], index) =>
      `<button data-map-mode="${mode}" style="min-width:44px;height:32px;padding:0 8px;font-size:12px;font-weight:${index === 0 ? 700 : 500};color:${index === 0 ? '#b45309' : '#374151'}" title="${label}\u5730\u56fe">${label}</button>`
    ).join('');
    if (topRight) topRight.appendChild(layerControl);

    layerControl.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const mode = target.dataset.mapMode as MapMode | undefined;
      if (!mode) return;

      layerControl.querySelectorAll('button').forEach(button => {
        const active = (button as HTMLElement).dataset.mapMode === mode;
        (button as HTMLElement).style.fontWeight = active ? '700' : '500';
        (button as HTMLElement).style.color = active ? '#b45309' : '#374151';
      });

      map.setStyle(getRasterStyle(mode));
      map.once('style.load', () => applyRoute(map));
    });

    map.on('load', () => applyRoute(map));
    mapInstance.current = map;

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    trailPathRef.current = trailPath;
    routeQualityRef.current = routeQuality;
    fitBoundsRef.current = fitBounds;

    if (map.isStyleLoaded()) {
      applyRoute(map);
    } else {
      const onStyle = () => { applyRoute(map); map.off('style.load', onStyle); };
      map.on('style.load', onStyle);
      return () => { map.off('style.load', onStyle); };
    }
  }, [trailPath, routeQuality, fitBounds]);

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
