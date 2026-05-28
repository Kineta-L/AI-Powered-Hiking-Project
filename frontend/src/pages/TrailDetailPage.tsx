import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import MapContainer from '../components/MapContainer';
import { getHikingPath } from '../lib/trailRouter';
import ElevationProfile from '../components/ElevationProfile';

interface TrailDetail {
  id: string; titleZh: string; titleEn: string; descriptionZh: string; descriptionEn: string;
  difficulty: string; distance: number; elevationGain: number; duration: number;
  season: string; region: string; country: string;
  author: { username: string; avatar: string } | null; status: string;
  days: { dayNumber: number; titleZh: string; titleEn: string; description: string; distance: number; elevation: number; highlights: string }[];
  coordinates: { latitude: number; longitude: number; elevation: number | null }[];
  reviews: { id: string; rating: number; content: string; createdAt: string; user: { username: string; avatar: string } }[];
  _count: { favorites: number };
}

const diffBadge = (d: string) => {
  const m: Record<string, string> = { easy: 'bg-emerald-500/10 text-emerald-400', moderate: 'bg-amber-500/10 text-amber-400', hard: 'bg-orange-500/10 text-orange-400', expert: 'bg-red-500/10 text-red-400' };
  return m[d] || 'bg-white/5 text-gray-400';
};

export default function TrailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [trail, setTrail] = useState<TrailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [trailPath, setTrailPath] = useState<[number, number][]>();
  const [favorited, setFavorited] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [userId, setUserId] = useState<string | null>(null);
  const isZh = i18n.language === 'zh';

  useEffect(() => {
    fetch(`/api/trails/${id}`).then(r => r.json()).then(d => {
      setTrail(d);
      if (d.coordinates?.length > 1) {
        getHikingPath(d.coordinates.map((c: any) => ({ lat: c.latitude, lng: c.longitude }))).then(setTrailPath);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) fetch(`/api/auth/me?clerkId=${user.id}`).then(r => r.json()).then(d => setUserId(d.id));
  }, [user]);

  const handleFavorite = async () => {
    if (!userId) return;
    const res = await fetch('/api/auth/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, trailId: trail?.id }) });
    setFavorited((await res.json()).favorited);
  };

  const handleReview = async () => {
    if (!userId || !reviewText.trim()) return;
    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trailId: trail?.id, userId, rating: reviewRating, content: reviewText }) });
    setReviewText('');
    const res = await fetch(`/api/trails/${id}`);
    setTrail(await res.json());
  };

  if (loading) return <p className="text-center text-gray-500 py-20">{t('common.loading')}</p>;
  if (!trail) return <p className="text-center text-gray-500 py-20">{t('common.error')}</p>;

  const title = isZh ? trail.titleZh : (trail.titleEn || trail.titleZh);
  const desc = isZh ? trail.descriptionZh : (trail.descriptionEn || trail.descriptionZh);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">{title}</h1>
        {trail.titleEn && isZh && <p className="text-lg text-gray-500">{trail.titleEn}</p>}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`px-3 py-1 rounded-lg text-sm border border-white/5 ${diffBadge(trail.difficulty)}`}>{t(`difficulty.${trail.difficulty}`, trail.difficulty)}</span>
          {trail.distance && <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">📏 {trail.distance} km</span>}
          {trail.elevationGain && <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">⛰️ +{trail.elevationGain}m</span>}
          {trail.duration && <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">📅 {trail.duration}{isZh ? '天' : 'd'}</span>}
          {trail.season && <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">🌤️ {t(`seasons.${trail.season}`, trail.season)}</span>}
          <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">📍 {trail.region || trail.country}</span>
        </div>
      </div>

      <div className="mb-8 rounded-2xl overflow-hidden border border-white/5 h-96">
        <MapContainer
          coordinates={trail.coordinates.length > 0 ? trail.coordinates : [{ latitude: 30, longitude: 104 }]}
          trailPath={trailPath} totalDays={0} showDayMarkers={false} showMarkers={false} interactive={true}
          fitBounds={trail.coordinates.length > 0}
        />
      </div>

      {trail.coordinates.filter(c => c.elevation).length > 2 && (
        <div className="mb-8 glass-light rounded-2xl border border-white/5 p-6">
          <h3 className="font-display text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider">⛰️ {isZh ? '海拔剖面' : 'Elevation Profile'}</h3>
          <div className="h-64"><ElevationProfile coordinates={trail.coordinates} /></div>
        </div>
      )}

      {desc && (
        <div className="mb-8 glass-light rounded-2xl border border-white/5 p-6">
          <h2 className="font-display text-lg font-semibold text-amber-400 mb-4">{t('trail.overview')}</h2>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{desc}</p>
        </div>
      )}

      {trail.days.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-4">{t('trail.days')}</h2>
          <div className="space-y-3">
            {trail.days.map(day => (
              <div key={day.dayNumber} className="glass-light rounded-xl border border-white/5 p-5 border-l-2 border-amber-500/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-bold font-display">{day.dayNumber}</span>
                  <h3 className="font-medium text-sm text-white">{isZh ? (day.titleZh || `第${day.dayNumber}天`) : (day.titleEn || `Day ${day.dayNumber}`)}</h3>
                  <div className="flex gap-3 ml-auto text-xs text-gray-500">{day.distance && <span>{day.distance} km</span>}{day.elevation && <span>+{day.elevation}m</span>}</div>
                </div>
                {day.description && <p className="text-xs text-gray-400 ml-11">{day.description}</p>}
                {day.highlights && <p className="text-amber-400/70 text-xs mt-1 ml-11">✨ {day.highlights}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <button onClick={handleFavorite} disabled={!userId}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${favorited ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'glass text-gray-400 border-white/10 hover:bg-white/5 hover:text-white'}`}>
          {favorited ? '❤️ ' + t('trail.unfavorite') : '🤍 ' + t('trail.favorite')}
          <span className="ml-1 text-xs opacity-50">({trail._count.favorites})</span>
        </button>
      </div>

      <div className="glass-light rounded-2xl border border-white/5 p-6">
        <h2 className="font-display text-lg font-semibold text-amber-400 mb-4">{t('trail.reviews')} ({trail.reviews.length})</h2>
        {userId && (
          <div className="mb-6 p-4 glass rounded-xl">
            <p className="text-xs text-gray-400 mb-2">{t('trail.writeReview')}</p>
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(n => <button key={n} onClick={() => setReviewRating(n)} className={`text-lg ${n <= reviewRating ? 'text-amber-400' : 'text-gray-600'}`}>★</button>)}
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white resize-none focus:outline-none focus:border-amber-500/50"
              placeholder="Share your experience..." />
            <button onClick={handleReview} className="mt-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium transition-all">
              {t('trail.submitReview')}
            </button>
          </div>
        )}
        {trail.reviews.length === 0 ? <p className="text-gray-500 text-sm">{t('trail.noReviews')}</p> : (
          <div className="space-y-4">
            {trail.reviews.map(r => (
              <div key={r.id} className="border-b border-white/5 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}</span>
                  <span className="text-xs text-gray-500">{r.user?.username || 'Anonymous'} · {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-300">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}