import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MapContainer from '../components/MapContainer';
import { apiFetch } from '../lib/api';
import TrailPreviewMap from '../components/TrailPreviewMap';
import { difficultyBadge, locationLabel, REGION_OPTIONS } from '../lib/trailMeta';

interface Trail {
  id: string;
  titleZh: string;
  titleEn: string;
  difficulty: string;
  distance: number;
  duration: number;
  region: string;
  country: string;
  season: string;
  coverImage: string;
  normalizedRegion?: string | null;
  coordinates?: { latitude: number; longitude: number }[];
  _count: { reviews: number; favorites: number };
}

const REGIONS = ['亚洲', 'Asia', '欧洲', 'Europe', '北美洲', 'North America', '南美洲', 'South America', '大洋洲', 'Oceania', '非洲', 'Africa'];
const DIFFICULTIES = ['easy', 'moderate', 'hard', 'expert'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter', 'all_year'];

const diffBadge = (d: string) => {
  const m: Record<string, string> = {
    easy: 'bg-emerald-500/10 text-emerald-400', moderate: 'bg-amber-500/10 text-amber-400',
    hard: 'bg-orange-500/10 text-orange-400', expert: 'bg-red-500/10 text-red-400',
  };
  return m[d] || 'bg-white/5 text-gray-400';
};

export default function TrailsPage() {
  const { t, i18n } = useTranslation();
  const [sp, setSp] = useSearchParams();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const region = sp.get('region') || '';
  const difficulty = sp.get('difficulty') || '';
  const season = sp.get('season') || '';
  const search = sp.get('search') || '';
  const page = Number(sp.get('page') || '1');
  const isZh = i18n.language === 'zh';

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (region) p.set('region', region);
    if (difficulty) p.set('difficulty', difficulty);
    if (season) p.set('season', season);
    if (search) p.set('search', search);
    p.set('page', String(page)); p.set('limit', '12');
    apiFetch(`/api/trails?${p}`).then(r => r.json()).then(d => { setTrails(d.trails || []); setTotal(d.total || 0); }).finally(() => setLoading(false));
  }, [region, difficulty, season, search, page]);

  const update = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v); else n.delete(k);
    n.set('page', '1'); setSp(n);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight mb-2">{t('trails.title')}</h1>
      <p className="text-sm text-gray-500 mb-6">{total} trails found</p>

      <div className="mb-6 md:mb-8 rounded-2xl overflow-hidden border border-white/5 h-52 md:h-64">
        <MapContainer coordinates={[{ latitude: 35, longitude: 105 }]} interactive={false} fitBounds={false} />
      </div>

      <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
        {search && (
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-sm flex items-center gap-2 border border-amber-500/20">
            "{search}" <button onClick={() => update('search', '')} className="hover:text-white">×</button>
          </span>
        )}
        <select value={region} onChange={e => update('region', e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/10 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50">
          <option className="bg-zinc-900 text-white" value="">{t('trails.allRegions')}</option>
          {REGION_OPTIONS.map(r => <option className="bg-zinc-900 text-white" key={r.key} value={r.key}>{isZh ? r.zh : r.en}</option>)}
        </select>
        <select value={difficulty} onChange={e => update('difficulty', e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/10 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50">
          <option className="bg-zinc-900 text-white" value="">{t('trails.allDifficulties')}</option>
          {DIFFICULTIES.map(d => <option className="bg-zinc-900 text-white" key={d} value={d}>{t(`difficulty.${d}`, d)}</option>)}
        </select>
        <select value={season} onChange={e => update('season', e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/10 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50">
          <option className="bg-zinc-900 text-white" value="">{t('trails.allSeasons')}</option>
          {SEASONS.map(s => <option className="bg-zinc-900 text-white" key={s} value={s}>{t(`seasons.${s}`, s)}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-12">{t('common.loading')}</p>
      ) : trails.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t('trails.noResults')}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {trails.map(trail => (
              <Link key={trail.id} to={`/trails/${trail.id}`}
                className="group glass-light rounded-2xl overflow-hidden border border-white/5 hover:border-amber-500/20 transition-all duration-300 hover:-translate-y-0.5">
                <TrailPreviewMap trail={trail} />
                <div className="p-5">
                  <h3 className="font-display font-semibold text-white group-hover:text-amber-400 transition-colors">{trail.titleZh}</h3>
                  {trail.titleEn && <p className="text-xs text-gray-500 mt-0.5">{trail.titleEn}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs border ${difficultyBadge(trail.difficulty)}`}>
                      {t(`difficulty.${trail.difficulty}`, trail.difficulty)}
                    </span>
                    {trail.distance && <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-400">{trail.distance} km</span>}
                    {trail.duration && <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-400">{trail.duration}d</span>}
                    <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-500">{locationLabel(trail, isZh)}</span>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-600">
                    <span>⭐ {trail._count.reviews}</span>
                    <span>❤️ {trail._count.favorites}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {total > 12 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && <button onClick={() => update('page', String(page - 1))} className="px-4 py-2 rounded-xl glass text-sm hover:bg-white/10 transition-colors">← Prev</button>}
              {page * 12 < total && <button onClick={() => update('page', String(page + 1))} className="px-4 py-2 rounded-xl glass text-sm hover:bg-white/10 transition-colors">Next →</button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
