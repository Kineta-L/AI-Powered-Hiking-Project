import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../lib/api';
import TrailPreviewMap from '../components/TrailPreviewMap';
import { difficultyBadge as getDifficultyBadge, locationLabel } from '../lib/trailMeta';

interface Trail {
  id: string;
  titleZh: string;
  titleEn: string;
  difficulty: string;
  distance: number;
  elevationGain: number;
  duration: number;
  region: string;
  country: string;
  coverImage: string;
  normalizedRegion?: string | null;
  coordinates?: { latitude: number; longitude: number }[];
  _count: { reviews: number; favorites: number };
}

const difficultyBadge = (d: string) => {
  const map: Record<string, string> = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hard: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    expert: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return map[d] || 'bg-white/5 text-gray-400 border-white/10';
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [trails, setTrails] = useState<Trail[]>([]);
  const isZh = i18n.language === 'zh';

  useEffect(() => {
    apiFetch('/api/trails?limit=6')
      .then(r => r.json())
      .then(d => setTrails(d.trails || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <section className="relative px-4 py-14 md:py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="relative">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              {t('home.hero')}
            </span>
          </h1>
          <p className="text-base text-gray-400 mb-7 max-w-lg mx-auto leading-relaxed">
            {t('home.heroSub')}
          </p>

          <form onSubmit={e => { e.preventDefault(); if (search.trim()) navigate(`/trails?search=${encodeURIComponent(search.trim())}`); }}
            className="flex max-w-md mx-auto gap-2">
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('home.searchPlaceholder')}
              className="flex-1 px-5 py-3.5 rounded-2xl glass border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all text-sm"
            />
            <button type="submit"
              className="px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-medium transition-all text-lg">
              🔍
            </button>
          </form>

          <button onClick={() => navigate('/planner')}
            className="mt-5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold transition-all text-sm tracking-wide font-display shadow-lg shadow-amber-500/20">
            🧠 {t('home.startPlan')}
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
        <div className="flex justify-between items-end mb-5 md:mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">{t('home.featuredTrails')}</h2>
            <p className="text-sm text-gray-500 mt-1">{trails.length} trails in database</p>
          </div>
          <Link to="/trails" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
            {t('home.viewAll')} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {trails.map(trail => (
            <Link key={trail.id} to={`/trails/${trail.id}`}
              className="group glass-light rounded-2xl overflow-hidden border border-white/5 hover:border-amber-500/20 transition-all duration-300 hover:-translate-y-0.5">
              <TrailPreviewMap trail={trail} />
              <div className="p-5">
                <h3 className="font-display font-semibold text-base text-white group-hover:text-amber-400 transition-colors">
                  {trail.titleZh}
                </h3>
                {trail.titleEn && <p className="text-xs text-gray-500 mt-0.5">{trail.titleEn}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-2 py-0.5 rounded-md text-xs border ${getDifficultyBadge(trail.difficulty)}`}>
                    {t(`difficulty.${trail.difficulty}`, trail.difficulty)}
                  </span>
                  {trail.distance && <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-400 border border-white/5">{trail.distance} km</span>}
                  {trail.duration && <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-400 border border-white/5">{trail.duration}d</span>}
                  <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-500 border border-white/5">{locationLabel(trail, isZh)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
