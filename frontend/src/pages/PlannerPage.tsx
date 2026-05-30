import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import MapContainer from '../components/MapContainer';
import { geocode } from '../lib/geocode';
import { apiFetch } from '../lib/api';
import { getHikingPath } from '../lib/trailRouter';
import { downloadWordDoc } from '../lib/download';

interface RoutePoint { name: string; lat: number; lng: number; type: string; }
interface PlanResult {
  overview?: string; difficulty?: string; totalDistance?: number; totalElevation?: number; bestSeason?: string;
  days?: { day: number; title: string; description: string; distance: number; elevation: number; highlights: string }[];
  gearList?: string[]; safetyTips?: string[]; routePoints?: RoutePoint[]; validationWarnings?: string[];
}

type RouteTrust = {
  quality: 'verified' | 'routed' | 'estimated' | 'none';
  label: string;
  message: string;
};

const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function PlannerPage() {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const isZh = i18n.language === 'zh';

  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [fitness, setFitness] = useState('intermediate');
  const [preferences, setPreferences] = useState('');
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState('');
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number; name?: string }[]>(
    [{ latitude: 30, longitude: 104 }]
  );
  const [geocoding, setGeocoding] = useState(false);
  const [trailPath, setTrailPath] = useState<[number, number][] | undefined>();
  const [routeEngine, setRouteEngine] = useState<'seed' | 'osrm' | 'waypoints' | 'none'>('none');
  const [routeTrust, setRouteTrust] = useState<RouteTrust | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seedPathRef = useRef<[number, number][] | undefined>(undefined);
  const planReceivedRef = useRef(false);

  useEffect(() => {
    if (user) apiFetch(`/api/auth/me?clerkId=${user.id}`).then(r => r.json()).then(d => setUserId(d.id));
  }, [user]);

  // Geocode on destination change
  const handleDestChange = useCallback((val: string) => {
    setDestination(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) return;
    debounceRef.current = setTimeout(async () => {
      setGeocoding(true);
      const geo = await geocode(val);
      if (geo) setMapCenter([{ latitude: geo.lat, longitude: geo.lng, name: geo.name }]);
      setGeocoding(false);
    }, 800);
  }, []);

  // Track if we already have a seed route path
  const [hasSeedPath, setHasSeedPath] = useState(false);

  // Update map when AI generates route points - fetch real trail paths
  useEffect(() => {
    // Skip OSRM if we already have real seed coordinates
    if (hasSeedPath) return;
    
    if (result?.routePoints && result.routePoints.length > 0) {
      // Validate distance matches days+fitness
      const fitnessDist: Record<string, [number, number]> = {
        beginner: [8, 12], intermediate: [12, 18], advanced: [18, 25], expert: [25, 35]
      };
      const [minDaily, maxDaily] = fitnessDist[fitness] || [12, 18];
      const maxExpectedKm = days * maxDaily * 1.2; // Allow 20% buffer

      let routePoints = result.routePoints;
      if (result.totalDistance && result.totalDistance > maxExpectedKm) {
        console.warn('[Planner] AI returned', result.totalDistance, 'km but max expected is', Math.round(maxExpectedKm), 'km. Trimming routePoints.');
        // Trim routePoints to only keep points within expected distance
        const expectedPoints = Math.max(4, Math.ceil(days * 4));
        routePoints = routePoints.slice(0, expectedPoints);
      }

      const pts = routePoints.map(p => ({ latitude: p.lat, longitude: p.lng, name: p.name }));
      setMapCenter(pts);
      // Fetch real hiking trail between all waypoints
      getHikingPath(routePoints.map(p => ({ lat: p.lat, lng: p.lng })))
        .then(result => {
          setTrailPath(result.path);
          setRouteEngine(result.engine);
          if (result.engine === 'osrm') {
            setRouteTrust({
              quality: 'routed',
              label: isZh ? 'OSM 路网匹配' : 'OSM routed',
              message: isZh ? '路线已匹配到 OpenStreetMap 路网，可信度中高。' : 'Route matched OpenStreetMap routing data.',
            });
          } else if (result.engine === 'waypoints') {
            setRouteTrust({
              quality: 'estimated',
              label: isZh ? '估算路线' : 'Estimated route',
              message: isZh ? '没有找到可用路网，仅使用 AI 坐标点估算，请出行前核对官方轨迹。' : 'No routable path was found. Verify with an official GPX before hiking.',
            });
          } else {
            setRouteTrust({
              quality: 'none',
              label: isZh ? '暂无可信路线' : 'No trusted route',
              message: isZh ? 'AI 未提供足够路线点，地图不会绘制实线。' : 'Not enough route data to draw a trusted path.',
            });
          }
        });
    } else {
      setTrailPath(undefined); setRouteEngine('none');
      setRouteTrust(null);
    }
  }, [result, hasSeedPath, days, fitness, isZh]);
  

  const generate = async () => {
    if (!destination.trim()) return;
    seedPathRef.current = undefined;
    planReceivedRef.current = false;
    setGenerating(true); setError(''); setContent(''); setResult(null); setShowResults(false); setHasSeedPath(false); setTrailPath(undefined); setRouteEngine('none'); setRouteTrust(null);

    try {
      const res = await apiFetch('/api/ai/plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days, fitness, preferences, language: isZh ? 'zh' : 'en', userId }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder(); let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'seed_route' && data.coordinates) {
              // Keep the database route as the source of truth for known classic trails.
              seedPathRef.current = data.coordinates;
              setTrailPath(data.coordinates);
              setRouteEngine('seed');
              setHasSeedPath(true);
              setRouteTrust({
                quality: 'verified',
                label: isZh ? '真实徒步路线' : 'Verified hiking route',
                message: isZh ? '路线来自真实轨迹数据，可信度高。' : 'Route is based on known real trail geometry.',
              });
              console.log('[Planner] Got real seed route:', data.coordinates.length, 'coords');
            }
            if (data.type === 'route_quality') {
              setRouteTrust({
                quality: data.quality || 'none',
                label: data.label,
                message: data.message,
              });
            }
            if (data.type === 'content') { fullText += data.content; setContent(fullText); }
            else if (data.type === 'plan' && data.plan) {
              const parsed = data.plan;
              if (seedPathRef.current) {
                parsed.routePoints = seedPathRef.current.map(([lng, lat]: [number, number], index: number) => ({
                  name: index === 0 ? 'Start' : index === seedPathRef.current!.length - 1 ? 'End' : '',
                  lat,
                  lng,
                  type: index === 0 ? 'start' : index === seedPathRef.current!.length - 1 ? 'end' : 'camp',
                }));
              }
              planReceivedRef.current = true;
              setResult(parsed);
              setShowResults(true);
            }
            else if (data.type === 'done') {
              if (!planReceivedRef.current) {
                try {
                  const cleaned = fullText.replace(/```json|```/g, '').trim();
                  const parsed = JSON.parse(cleaned);
                  if (seedPathRef.current) {
                    parsed.routePoints = seedPathRef.current.map(([lng, lat]: [number, number], index: number) => ({
                      name: index === 0 ? 'Start' : index === seedPathRef.current!.length - 1 ? 'End' : '',
                      lat,
                      lng,
                      type: index === 0 ? 'start' : index === seedPathRef.current!.length - 1 ? 'end' : 'camp',
                    }));
                  }
                  setResult(parsed);
                } catch {
                  setError(isZh ? 'AI 返回的内容无法解析，请重试。' : 'The AI response could not be parsed. Please retry.');
                }
              }
              setShowResults(true);
            } else if (data.type === 'validation_error') {
              setError(data.message || (isZh ? 'AI 返回的行程结构不完整，请重试。' : 'The AI returned an incomplete plan. Please retry.'));
              setShowResults(false);
            } else if (data.type === 'error') { setError(data.message); }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e.message?.includes('fetch failed') || e.message?.includes('timeout')) {
        setError(isZh
          ? '无法连接 AI 服务（api.openai.com 不可达）。请检查网络代理，或在 .env 中将 AI_BASE_URL 改为可用的 AI 接口地址。'
          : 'Cannot reach AI service (api.openai.com unreachable). Check your proxy/VPN, or set AI_BASE_URL to an accessible endpoint.');
      } else {
        setError(e.message);
      }
    } finally { setGenerating(false); }
  };

  const mapCoords = mapCenter;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] relative flex flex-col md:flex-row">
      <div className="relative order-2 h-[45vh] min-h-80 z-0 md:absolute md:inset-0 md:order-none md:h-auto">
        <MapContainer coordinates={mapCoords} trailPath={trailPath} totalDays={days} showDayMarkers={false} showMarkers={false} routeQuality={routeEngine} interactive={true} fitBounds={!!(result?.routePoints && result.routePoints.length > 0)}
        />
      </div>

      <div className="relative order-1 z-10 w-full md:w-[440px] md:h-full glass border-b md:border-b-0 md:border-r border-white/5 flex flex-col shrink-0">
        <div className="p-4 md:p-6 md:pb-4">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">🧠 {t('planner.title')}</h1>
          <p className="text-sm text-gray-400 mt-1">{isZh ? '输入需求，AI 实时生成徒步行程' : 'AI-powered hiking trip planner'}</p>
        </div>

        <div className="flex-1 overflow-visible px-4 pb-5 md:overflow-y-auto md:px-6 md:pb-6" ref={contentRef}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                {t('planner.destination')} * {geocoding && <span className="text-amber-400 animate-pulse ml-1">📍 定位中...</span>}
              </label>
              <input
                type="text" value={destination} onChange={e => handleDestChange(e.target.value)}
                placeholder={isZh ? '尼泊尔 ABC、虎跳峡、TMB...' : 'Everest Base Camp, Inca Trail...'}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{t('planner.days')}</label>
                <select value={days} onChange={e => setDays(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl bg-zinc-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 text-sm">
                  {[1,2,3,4,5,6,7,8,10,12,14,18,21].map(n => <option className="bg-zinc-900 text-white" key={n} value={n}>{n} {isZh ? '天' : 'd'}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{t('planner.fitness')}</label>
                <select value={fitness} onChange={e => setFitness(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-zinc-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 text-sm">
                  {FITNESS_LEVELS.map(f => <option className="bg-zinc-900 text-white" key={f} value={f}>{t(`fitness.${f}`, f)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{t('planner.preferences')}</label>
              <input type="text" value={preferences} onChange={e => setPreferences(e.target.value)}
                placeholder={isZh ? '风景摄影、文化体验、轻装...' : 'Photography, culture, ultralight...'}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all text-sm" />
            </div>

            <button onClick={generate} disabled={generating || !destination.trim()}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm tracking-wide font-display">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {t('planner.generating')}
                </span>
              ) : ('🧠 ' + t('planner.generate'))}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm leading-relaxed whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {generating && content && (
            <div className="mt-6 glass-light rounded-xl p-4">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono text-xs leading-relaxed">{content}</pre>
            </div>
          )}

          {showResults && result && (
            <div className="mt-6 space-y-4">
              {result.overview && (
                <div className="glass-light rounded-2xl p-5">
                  <h3 className="font-display text-sm font-semibold text-amber-400 mb-2 uppercase tracking-wider">{t('planner.overview')}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{result.overview}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.difficulty && <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-300 border border-white/5">📊 {result.difficulty}</span>}
                    {result.totalDistance && <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-300 border border-white/5">📏 {result.totalDistance} km</span>}
                    {result.totalElevation && <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-300 border border-white/5">⛰️ +{result.totalElevation}m</span>}
                    {result.bestSeason && <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-300 border border-white/5">🌤️ {result.bestSeason}</span>}
                  </div>
                  {routeTrust && (
                    <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                      routeTrust.quality === 'verified' ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25' :
                      routeTrust.quality === 'routed' ? 'bg-sky-500/15 text-sky-200 border-sky-500/25' :
                      routeTrust.quality === 'estimated' ? 'bg-amber-500/15 text-amber-200 border-amber-500/25' :
                      'bg-white/5 text-gray-300 border-white/5'
                    }`}>
                      <span className="font-medium">{routeTrust.label}</span>
                      <span className="ml-2 text-gray-300">{routeTrust.message}</span>
                    </div>
                  )}
                  {result.validationWarnings && result.validationWarnings.length > 0 && (
                    <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                      {result.validationWarnings[0]}
                    </div>
                  )}
                </div>
              )}

              {/* Download button */}
              <div className="flex justify-end">
                <button
                  onClick={() => downloadWordDoc(result, destination, days, fitness, isZh ? 'zh' : 'en')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/25 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  {isZh ? '下载攻略' : 'Download Plan'}
                </button>
              </div>

              {result.days && result.days.length > 0 && (
                <div>
                  <h3 className="font-display text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">{t('planner.itinerary')}</h3>
                  <div className="space-y-3">
                    {result.days.map(day => (
                      <div key={day.day} className="glass-light rounded-xl p-4 border-l-2 border-amber-500/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-bold font-display">{day.day}</span>
                          <h4 className="font-medium text-sm text-white">{day.title || t('planner.day', { n: day.day })}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed ml-8">{day.description}</p>
                        <div className="flex gap-3 ml-8 mt-1.5 text-xs text-gray-500">
                          {day.distance && <span>{day.distance} km</span>}
                          {day.elevation && <span>+{day.elevation}m</span>}
                          {day.highlights && <span className="text-amber-400/70">✨ {day.highlights}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.gearList && result.gearList.length > 0 && (
                <div className="glass-light rounded-xl p-4">
                  <h3 className="font-display text-sm font-semibold text-amber-400 mb-2 uppercase tracking-wider">🎒 {t('planner.gear')}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.gearList.map((item, i) => <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-300 border border-white/5">{item}</span>)}
                  </div>
                </div>
              )}
              {result.safetyTips && result.safetyTips.length > 0 && (
                <div className="glass-light rounded-xl p-4">
                  <h3 className="font-display text-sm font-semibold text-amber-400 mb-2 uppercase tracking-wider">⚠️ {t('planner.safety')}</h3>
                  <ul className="space-y-1.5">
                    {result.safetyTips.map((tip, i) => <li key={i} className="flex gap-2 text-xs text-gray-400"><span className="text-amber-500 shrink-0 mt-0.5">•</span> {tip}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {showResults && !result && content && (
            <div className="mt-6 glass-light rounded-xl p-4">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{content}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
