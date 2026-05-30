import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import MapContainer from '../components/MapContainer';
import { apiFetch } from '../lib/api';
import { getHikingPath } from '../lib/trailRouter';
import ElevationProfile from '../components/ElevationProfile';
import { downloadTrailGuideDoc } from '../lib/download';
import { getTrailDisplayPath, isTigerLeapingGorgeTrail } from '../lib/knownTrailPaths';
import { difficultyBadge as getDifficultyBadge, seasonLabel } from '../lib/trailMeta';

interface TrailDetail {
  id: string; titleZh: string; titleEn: string; descriptionZh: string; descriptionEn: string;
  difficulty: string; distance: number; elevationGain: number; duration: number;
  season: string; region: string; country: string;
  normalizedSeasons?: string[];
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

interface GuideSection {
  key: string;
  icon: string;
  title: string;
  items: string[];
}

function isTigerTrail(trail: TrailDetail) {
  return `${trail.titleZh} ${trail.titleEn || ''}`.toLowerCase().includes('tiger leaping gorge') ||
    trail.titleZh.includes('虎跳峡');
}

function buildTrailGuide(trail: TrailDetail, isZh: boolean) {
  const hardTrail = trail.difficulty === 'hard' || trail.difficulty === 'expert' || (trail.elevationGain || 0) > 1200;
  const multiDay = (trail.duration || 1) > 1;
  const uploaded = trail.status === 'user';

  if (isTigerTrail(trail)) {
    return [
      {
        key: 'transport', icon: '🚌', title: isZh ? '交通' : 'Transport',
        items: isZh
          ? ['常见进山方式是丽江客运站或包车到桥头/纳西雅阁，建议提前确认班次。', '终点可在中虎跳、核桃园或 Tina’s 一带联系返程车回丽江/香格里拉。', '峡谷道路弯多且落石风险较高，雨天不建议夜间乘车。']
          : ['Common access is by bus or private transfer from Lijiang to Qiaotou or Naxi Family Guesthouse.', 'Arrange return transport from Middle Tiger Leaping Gorge, Walnut Garden, or Tina’s area.', 'Avoid night transfers in rain because gorge roads are narrow and rockfall-prone.'],
      },
      {
        key: 'supply', icon: '🥤', title: isZh ? '补给' : 'Resupply',
        items: isZh
          ? ['纳西雅阁、茶马客栈、Halfway、中途客栈等节点通常可买水和简餐。', '每天至少携带 1.5-2L 水，夏季和暴晒天气增加到 2.5L。', '部分客栈网络和支付不稳定，建议准备少量现金。']
          : ['Water and simple meals are usually available at Naxi Family, Tea Horse, Halfway, and nearby guesthouses.', 'Carry at least 1.5-2L water per day, more in hot exposed weather.', 'Keep some cash because mobile payment and signal can be unreliable.'],
      },
      {
        key: 'stay', icon: '🛏️', title: isZh ? '住宿' : 'Accommodation',
        items: isZh
          ? ['经典住宿节点包括茶马客栈、Halfway、中途客栈、Tina’s/核桃园一带。', '旺季和节假日建议提前预订，临崖景观房更紧张。', '轻装徒步可依靠客栈住宿，不建议无经验者在峡谷野营。']
          : ['Classic overnight stops include Tea Horse, Halfway, Middle Gorge guesthouses, and Tina’s/Walnut Garden area.', 'Book ahead in peak season and holidays, especially view rooms.', 'Guesthouse trekking is recommended; wild camping in the gorge is not ideal for beginners.'],
      },
      {
        key: 'risk', icon: '⚠️', title: isZh ? '风险' : 'Risks',
        items: isZh
          ? ['28 道拐持续爬升且暴晒，注意配速和补水。', '雨季可能有落石、塌方和湿滑路段，出发前确认当地开放情况。', '中虎跳下切路段台阶陡，膝盖压力大，建议使用登山杖。']
          : ['The 28 Bends climb is exposed and sustained; pace conservatively and hydrate.', 'Rainy season can bring rockfall, landslides, and slippery trail. Check local access before departure.', 'The descent to Middle Tiger Leaping Gorge is steep and hard on knees; trekking poles help.'],
      },
      {
        key: 'season', icon: '🌤️', title: isZh ? '季节' : 'Season',
        items: isZh
          ? ['推荐 3-5 月和 9-11 月，能见度、温度和路况相对平衡。', '7-8 月雨季落石和塌方风险更高，冬季早晚温差明显。', '峡谷日照强，即使春秋也需要防晒。']
          : ['Best windows are March-May and September-November for visibility, temperature, and trail conditions.', 'July-August has higher rain, rockfall, and landslide risk; winter mornings and evenings are cold.', 'Sun exposure is strong even in spring and autumn.'],
      },
      {
        key: 'gear', icon: '🎒', title: isZh ? '装备' : 'Gear',
        items: isZh
          ? ['防滑徒步鞋、登山杖、防晒帽、太阳镜、防晒霜。', '轻量雨衣或冲锋衣、保暖层、头灯、充电宝。', '基础急救包、膝盖贴/护膝、能量食品和垃圾袋。']
          : ['Grippy hiking shoes, trekking poles, sun hat, sunglasses, and sunscreen.', 'Light rain shell, warm layer, headlamp, and power bank.', 'Basic first aid, knee support or tape, trail snacks, and trash bag.'],
      },
    ];
  }

  return [
    {
      key: 'transport', icon: '🚌', title: isZh ? '交通' : 'Transport',
      items: isZh
        ? [`优先查询 ${trail.region || trail.country || '目的地'} 最近的公共交通、景区接驳或包车入口。`, multiDay ? '多日路线建议提前确认终点返程车，避免走到终点后无法离开。' : '一日路线建议预留返程缓冲，山区叫车和信号可能不稳定。', uploaded ? '这是用户上传轨迹，交通入口需出行前自行核对。' : '热门路线建议旺季提前预订进山交通。']
        : [`Check the closest public transport, shuttle, or private transfer access for ${trail.region || trail.country || 'the trail area'}.`, multiDay ? 'Confirm exit transport before starting a multi-day route.' : 'Leave a return buffer for day hikes because mountain transport and signal can be unreliable.', uploaded ? 'This is a user-uploaded track; verify trailhead access before departure.' : 'Book access transport early in peak season.'],
    },
    {
      key: 'supply', icon: '🥤', title: isZh ? '补给' : 'Resupply',
      items: isZh
        ? [multiDay ? '多日路线按每天独立补给规划，至少准备一顿应急餐。' : '一日路线也建议携带足量水和高热量路餐。', hardTrail ? '高爬升路线耗水更快，出发前确认沿途水源。' : '中等以下路线仍需确认沿途商店/水源是否季节性关闭。', '山区移动支付和网络可能不稳定，建议准备少量现金。']
        : [multiDay ? 'Plan resupply day by day and carry at least one emergency meal.' : 'Carry enough water and calorie-dense snacks even for a day hike.', hardTrail ? 'High-elevation-gain routes consume water quickly; confirm water sources before departure.' : 'Verify whether shops or water points are seasonal.', 'Carry some cash because payment and signal may be unreliable.'],
    },
    {
      key: 'stay', icon: '🛏️', title: isZh ? '住宿' : 'Accommodation',
      items: isZh
        ? [multiDay ? '多日路线应提前确认客栈、营地或避难屋位置。' : '一日路线通常不需要住宿，但建议了解附近应急住宿点。', '旺季、周末和节假日建议提前预订。', uploaded ? '上传轨迹不代表沿途一定有合法营地或住宿。' : '优先选择靠近每日终点的住宿，减少摸黑行走。']
        : [multiDay ? 'Confirm guesthouses, campsites, or shelters before starting.' : 'Overnight stay is usually unnecessary, but know nearby emergency lodging.', 'Book ahead on weekends, holidays, and peak season.', uploaded ? 'Uploaded tracks do not guarantee legal camping or lodging options.' : 'Stay close to daily endpoints to avoid hiking after dark.'],
    },
    {
      key: 'risk', icon: '⚠️', title: isZh ? '风险' : 'Risks',
      items: isZh
        ? [hardTrail ? '该路线强度较高，注意高爬升、膝盖负担和天气突变。' : '注意路面湿滑、岔路和山区天气变化。', (trail.elevationGain || 0) > 1000 ? '累计爬升较大，建议控制配速并携带登山杖。' : '即使爬升不高，也应避免低估返程时间。', '出发前核对当地公告、封路、火险和天气预警。']
        : [hardTrail ? 'This is a demanding route; manage elevation gain, knee load, and fast weather changes.' : 'Watch for slippery surfaces, side trails, and changing mountain weather.', (trail.elevationGain || 0) > 1000 ? 'Large elevation gain: pace conservatively and use trekking poles.' : 'Do not underestimate return time even on lower-gain routes.', 'Check local notices, closures, fire risk, and weather alerts before departure.'],
    },
    {
      key: 'season', icon: '🌤️', title: isZh ? '季节' : 'Season',
      items: isZh
        ? [`当前标注季节：${trail.season || '未标注，建议查询当地最佳徒步季' }。`, '雨季关注塌方、落石和涉水风险；冬季关注积雪结冰。', '高海拔和暴露路段全年都需要防晒和防风。']
        : [`Listed season: ${trail.season || 'not specified; check the local hiking season'}.`, 'In rainy season, watch for landslides, rockfall, and water crossings; in winter, watch for snow and ice.', 'High or exposed terrain needs sun and wind protection year-round.'],
    },
    {
      key: 'gear', icon: '🎒', title: isZh ? '装备' : 'Gear',
      items: isZh
        ? ['防滑徒步鞋、速干层、保暖层、雨具。', hardTrail ? '建议携带登山杖、头灯、护膝/肌贴和更完整急救包。' : '建议携带头灯、基础急救包、充电宝。', '离线地图、备用轨迹、足量水、路餐和垃圾袋。']
        : ['Grippy hiking shoes, quick-dry layer, warm layer, and rain protection.', hardTrail ? 'Bring trekking poles, headlamp, knee support or tape, and a fuller first aid kit.' : 'Bring a headlamp, basic first aid, and power bank.', 'Offline map, backup GPX, enough water, snacks, and trash bag.'],
    },
  ];
}

export default function TrailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [trail, setTrail] = useState<TrailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [trailPath, setTrailPath] = useState<[number, number][]>();
  const [routeEngine, setRouteEngine] = useState<'seed' | 'osrm' | 'waypoints' | 'none'>('none');
  const [routeNote, setRouteNote] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [userId, setUserId] = useState<string | null>(null);
  const isZh = i18n.language === 'zh';

  useEffect(() => {
    apiFetch(`/api/trails/${id}`).then(r => r.json()).then(d => {
      setTrail(d);
      if (d.coordinates?.length > 1) {
        const displayPath = getTrailDisplayPath(d);
        if (isTigerLeapingGorgeTrail(d) || displayPath.length >= 20 || d.status === 'user') {
          setTrailPath(displayPath);
          setRouteEngine('seed');
          setRouteNote('');
          return;
        }

        getHikingPath(d.coordinates.map((c: any) => ({ lat: c.latitude, lng: c.longitude })))
          .then(result => {
            if (result.engine === 'osrm' && result.path.length >= 20) {
              setTrailPath(result.path);
              setRouteEngine('osrm');
              setRouteNote('');
            } else {
              setTrailPath(undefined);
              setRouteEngine('none');
              setRouteNote(i18n.language === 'zh'
                ? '这条路线目前只有简化点位，尚未接入可验证的完整轨迹；为避免误导，地图暂不绘制实线。'
                : 'This trail only has simplified waypoints for now. The map hides the line until a verified full track is available.');
            }
          });
      }
    }).finally(() => setLoading(false));
  }, [id, i18n.language]);

  useEffect(() => {
    if (user) apiFetch(`/api/auth/me?clerkId=${user.id}`).then(r => r.json()).then(d => setUserId(d.id));
  }, [user]);

  const handleFavorite = async () => {
    if (!userId) return;
    const res = await apiFetch('/api/auth/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, trailId: trail?.id }) });
    setFavorited((await res.json()).favorited);
  };

  const handleReview = async () => {
    if (!userId || !reviewText.trim()) return;
    await apiFetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trailId: trail?.id, userId, rating: reviewRating, content: reviewText }) });
    setReviewText('');
    const res = await apiFetch(`/api/trails/${id}`);
    setTrail(await res.json());
  };

  if (loading) return <p className="text-center text-gray-500 py-20">{t('common.loading')}</p>;
  if (!trail) return <p className="text-center text-gray-500 py-20">{t('common.error')}</p>;

  const title = isZh ? trail.titleZh : (trail.titleEn || trail.titleZh);
  const desc = isZh ? trail.descriptionZh : (trail.descriptionEn || trail.descriptionZh);
  const guideSections = buildTrailGuide(trail, isZh);
  const downloadGuide = () => downloadTrailGuideDoc({
    title,
    overview: desc,
    stats: {
      difficulty: t(`difficulty.${trail.difficulty}`, trail.difficulty),
      distance: trail.distance,
      elevationGain: trail.elevationGain,
      duration: trail.duration,
      season: trail.season,
      region: trail.region,
      country: trail.country,
    },
    days: trail.days.map(day => ({
      dayNumber: day.dayNumber,
      title: isZh ? (day.titleZh || `第${day.dayNumber}天`) : (day.titleEn || `Day ${day.dayNumber}`),
      description: day.description,
      distance: day.distance,
      elevation: day.elevation,
      highlights: day.highlights,
    })),
    sections: guideSections.map(section => ({ title: section.title, items: section.items })),
  }, isZh ? 'zh' : 'en');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">{title}</h1>
            {trail.titleEn && isZh && <p className="text-lg text-gray-500">{trail.titleEn}</p>}
          </div>
          <button onClick={downloadGuide}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/25 transition-all">
            {isZh ? '下载攻略' : 'Download Guide'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`px-3 py-1 rounded-lg text-sm border ${getDifficultyBadge(trail.difficulty)}`}>{t(`difficulty.${trail.difficulty}`, trail.difficulty)}</span>
          {trail.distance && <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">📏 {trail.distance} km</span>}
          {trail.elevationGain && <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">⛰️ +{trail.elevationGain}m</span>}
          {trail.duration && <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">📅 {trail.duration}{isZh ? '天' : 'd'}</span>}
          {trail.season && <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">🌤️ {trail.normalizedSeasons?.length ? trail.normalizedSeasons.map(s => t(`seasons.${s}`, s)).join(' / ') : seasonLabel(trail.season, isZh, (key, fallback) => t(key, { defaultValue: fallback }))}</span>}
          <span className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5">📍 {trail.region || trail.country}</span>
        </div>
      </div>

      <div className="mb-8 rounded-2xl overflow-hidden border border-white/5 h-96">
        <MapContainer
          coordinates={trail.coordinates.length > 0 ? trail.coordinates : [{ latitude: 30, longitude: 104 }]}
          trailPath={trailPath} totalDays={0} showDayMarkers={false} showMarkers={false} interactive={true}
          routeQuality={routeEngine}
          fitBounds={trail.coordinates.length > 0}
        />
      </div>
      {routeNote && (
        <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {routeNote}
        </div>
      )}

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

      <div className="mb-8">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">{isZh ? '出行攻略' : 'Trip Guide'}</h2>
            <p className="text-xs text-gray-500 mt-1">
              {isZh ? '交通、补给、住宿、风险、季节和装备建议，出发前请结合当地公告复核。' : 'Transport, resupply, lodging, risks, season, and gear notes. Verify locally before departure.'}
            </p>
          </div>
          <button onClick={downloadGuide}
            className="hidden md:inline-flex px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-all">
            {isZh ? '导出' : 'Export'}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {guideSections.map(section => (
            <section key={section.key} className="glass-light rounded-xl border border-white/5 p-5">
              <h3 className="font-display text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">
                <span className="mr-2">{section.icon}</span>{section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, index) => (
                  <li key={index} className="flex gap-2 text-xs text-gray-300 leading-relaxed">
                    <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

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
