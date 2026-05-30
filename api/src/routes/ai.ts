import { Router, Request, Response } from 'express';
import { prisma } from '../server';

export const aiRouter = Router();

const TIGER_LEAPING_GORGE_HIGH_TRAIL: [number, number][] = [
  [100.0724591, 27.1745277],
  [100.0729258, 27.1745544],
  [100.0734253, 27.1746343],
  [100.0735899, 27.1747048],
  [100.0737841, 27.1747437],
  [100.0739304, 27.1748106],
  [100.0737841, 27.1749525],
  [100.0737973, 27.1750149],
  [100.0737597, 27.1750827],
  [100.0736275, 27.1751659],
  [100.0735452, 27.1752075],
  [100.0736712, 27.1753169],
  [100.0738887, 27.1753938],
  [100.0738461, 27.1754372],
  [100.0740249, 27.1754742],
  [100.074075, 27.175524],
  [100.0738063, 27.1761706],
  [100.0738002, 27.1772681],
  [100.0733069, 27.1780372],
  [100.073674, 27.1787558],
  [100.0736894, 27.1791505],
  [100.0736616, 27.1794548],
  [100.0734392, 27.1796954],
  [100.0741047, 27.1797969],
  [100.0746039, 27.1798654],
  [100.0754419, 27.1795145],
  [100.0760797, 27.1795091],
  [100.0769824, 27.179383],
  [100.077916, 27.1792843],
  [100.0787756, 27.1790048],
  [100.0793579, 27.179087],
  [100.08035, 27.1791007],
  [100.0805503, 27.1797859],
  [100.0800683, 27.1810537],
  [100.0806448, 27.1823764],
  [100.0812062, 27.1824979],
  [100.0824656, 27.1830243],
  [100.0831264, 27.1831228],
  [100.0835233, 27.1832469],
  [100.0845855, 27.1832374],
  [100.0852873, 27.1833606],
  [100.0855301, 27.1834618],
  [100.0856818, 27.1834281],
  [100.085788, 27.1834956],
  [100.0860118, 27.1835428],
  [100.0862867, 27.1828885],
  [100.086457, 27.1828214],
  [100.0863783, 27.1837962],
  [100.0869789, 27.1846113],
  [100.087923, 27.1853032],
  [100.089087, 27.185501],
  [100.0907173, 27.1864912],
  [100.0913628, 27.1869193],
  [100.0921541, 27.1871583],
  [100.092957, 27.1864605],
  [100.094234, 27.18724],
  [100.0954853, 27.1874876],
  [100.0961233, 27.1877324],
  [100.0965372, 27.188016],
  [100.0971266, 27.1883322],
  [100.097789, 27.1881259],
  [100.0981, 27.188202],
  [100.098702, 27.1877756],
  [100.0988486, 27.1872009],
  [100.0989379, 27.1874578],
  [100.0991125, 27.1871697],
  [100.09946, 27.187077],
  [100.1002471, 27.1872031],
  [100.1008643, 27.1875384],
  [100.1010696, 27.1876309],
  [100.1011532, 27.1878186],
  [100.1013915, 27.187798],
  [100.1014422, 27.1881693],
  [100.1011933, 27.1884988],
  [100.101734, 27.188793],
  [100.1012653, 27.1890699],
  [100.1013069, 27.1892754],
  [100.1013651, 27.1894912],
  [100.1018503, 27.1895403],
  [100.102111, 27.189478],
  [100.1026329, 27.1901919],
  [100.1026909, 27.1905138],
  [100.1027642, 27.190865],
  [100.1030911, 27.1912037],
  [100.103185, 27.191509],
  [100.1037404, 27.1918754],
  [100.104192, 27.192296],
  [100.1043299, 27.1928175],
  [100.1047403, 27.1936181],
  [100.1058645, 27.1941034],
  [100.1062725, 27.1947182],
  [100.1063579, 27.195412],
  [100.1067117, 27.19584],
  [100.1066624, 27.1964602],
  [100.107002, 27.1968806],
  [100.1072823, 27.1972349],
  [100.1076234, 27.1970207],
  [100.1086259, 27.1970243],
  [100.1091982, 27.1968137],
  [100.1100599, 27.1970978],
  [100.1107801, 27.1974793],
  [100.110602, 27.19835],
  [100.1104127, 27.1992235],
  [100.1102978, 27.1998343],
  [100.1099889, 27.2005237],
  [100.1099233, 27.2016482],
  [100.1101204, 27.2026017],
  [100.110108, 27.203257],
  [100.1100193, 27.203711],
  [100.1097908, 27.2044867],
  [100.1097349, 27.2051178],
  [100.1097351, 27.2053178],
  [100.1090092, 27.2056763],
  [100.1089342, 27.2060525],
  [100.1091664, 27.2064967],
  [100.1093826, 27.2069042],
  [100.1096751, 27.207612],
  [100.1094523, 27.2080935],
  [100.109104, 27.208362],
  [100.109671, 27.208682],
  [100.110181, 27.20936],
  [100.1188084, 27.2183829],
  [100.1199099, 27.2190878],
  [100.1204521, 27.2193392],
  [100.121336, 27.21983],
  [100.121941, 27.220529],
  [100.1223622, 27.2211068],
  [100.1231879, 27.2215363],
  [100.123501, 27.2219331],
  [100.1232506, 27.222334],
  [100.123097, 27.2232706],
  [100.1230305, 27.223976],
  [100.1231487, 27.2246131],
  [100.1234482, 27.225063],
  [100.1236271, 27.2257389],
  [100.1239829, 27.2264778],
  [100.1242941, 27.226743],
  [100.1247712, 27.2270027],
  [100.1251892, 27.2275638],
  [100.12549, 27.2280042],
  [100.1262737, 27.2282791],
  [100.1272321, 27.2286288],
  [100.1271589, 27.2296184],
  [100.126859, 27.23013],
  [100.127547, 27.229806],
  [100.1283706, 27.229575],
  [100.128529, 27.230356],
  [100.1292531, 27.230806],
  [100.129695, 27.2309701],
  [100.1304098, 27.231064],
  [100.1309621, 27.2315732],
  [100.1311415, 27.2328333],
  [100.1402402, 27.2448186],
  [100.14082, 27.244983],
  [100.1406905, 27.2457501],
  [100.1400352, 27.2462291],
  [100.1403632, 27.2467836],
  [100.1411455, 27.2468891],
  [100.142134, 27.247139],
  [100.1427629, 27.2473759],
  [100.1423477, 27.2479404],
  [100.1418611, 27.249035],
  [100.1423707, 27.2494478],
  [100.1427744, 27.249397],
  [100.1440423, 27.2494097],
  [100.1447554, 27.2505396],
  [100.1449972, 27.2507513],
  [100.1455758, 27.2510437],
  [100.1457229, 27.2511322],
  [100.1460726, 27.2510636],
  [100.146218, 27.251286],
  [100.14635, 27.251667],
  [100.1465125, 27.2518155],
  [100.1468683, 27.2518463],
  [100.1473145, 27.2522759],
  [100.1477271, 27.2526874],
  [100.1483935, 27.2528865],
  [100.148806, 27.2540262],
  [100.1490544, 27.2543622],
  [100.1492784, 27.254996],
  [100.149056, 27.255508],
  [100.1493238, 27.2557488],
  [100.149927, 27.2558436],
  [100.1505197, 27.2562158],
  [100.1515337, 27.2564231],
  [100.1526667, 27.2565404],
  [100.1532446, 27.2565844],
];

type ValidatedPlan = {
  overview: string;
  difficulty: string;
  totalDistance: number;
  totalElevation: number;
  bestSeason: string;
  days: Array<{
    day: number;
    title: string;
    description: string;
    distance: number;
    elevation: number;
    highlights: string;
  }>;
  gearList: string[];
  safetyTips: string[];
  routePoints: Array<{ name: string; lat: number; lng: number; type: string }>;
  validationWarnings?: string[];
};

function extractJsonObject(text: string) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI did not return a JSON object');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

function asString(value: any, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asNumber(value: any, fallback = 0) {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function validatePlan(raw: any, minTotalKm: number, maxTotalKm: number, language?: string): ValidatedPlan {
  const errors: string[] = [];
  const warnings: string[] = [];

  const plan: ValidatedPlan = {
    overview: asString(raw?.overview),
    difficulty: asString(raw?.difficulty),
    totalDistance: asNumber(raw?.totalDistance),
    totalElevation: asNumber(raw?.totalElevation),
    bestSeason: asString(raw?.bestSeason),
    days: Array.isArray(raw?.days) ? raw.days.map((day: any, index: number) => ({
      day: Math.max(1, Math.round(asNumber(day?.day, index + 1))),
      title: asString(day?.title, `Day ${index + 1}`),
      description: asString(day?.description),
      distance: asNumber(day?.distance),
      elevation: asNumber(day?.elevation),
      highlights: asString(day?.highlights),
    })) : [],
    gearList: Array.isArray(raw?.gearList) ? raw.gearList.map((item: any) => asString(item)).filter(Boolean) : [],
    safetyTips: Array.isArray(raw?.safetyTips) ? raw.safetyTips.map((item: any) => asString(item)).filter(Boolean) : [],
    routePoints: Array.isArray(raw?.routePoints) ? raw.routePoints.map((point: any, index: number) => ({
      name: asString(point?.name, index === 0 ? 'Start' : ''),
      lat: asNumber(point?.lat, NaN),
      lng: asNumber(point?.lng, NaN),
      type: asString(point?.type, index === 0 ? 'start' : 'camp'),
    })).filter((point: any) =>
      Number.isFinite(point.lat) && Number.isFinite(point.lng) &&
      point.lat >= -90 && point.lat <= 90 && point.lng >= -180 && point.lng <= 180
    ) : [],
  };

  if (!plan.overview) errors.push('Missing overview');
  if (!plan.difficulty) errors.push('Missing difficulty');
  if (!plan.bestSeason) errors.push('Missing bestSeason');
  if (!plan.totalDistance || plan.totalDistance <= 0) errors.push('Missing totalDistance');
  if (plan.days.length === 0) errors.push('Missing days');
  if (plan.gearList.length === 0) errors.push('Missing gearList');
  if (plan.safetyTips.length === 0) errors.push('Missing safetyTips');

  const looseMin = minTotalKm * 0.5;
  const looseMax = maxTotalKm * 1.5;
  if (plan.totalDistance && (plan.totalDistance < looseMin || plan.totalDistance > looseMax)) {
    errors.push(`totalDistance ${plan.totalDistance}km is outside the expected range`);
  } else if (plan.totalDistance && (plan.totalDistance < minTotalKm || plan.totalDistance > maxTotalKm)) {
    warnings.push(language === 'zh'
      ? `规划距离 ${plan.totalDistance}km 不在理想的 ${minTotalKm}-${maxTotalKm}km 范围内`
      : `Distance ${plan.totalDistance}km is outside the ideal ${minTotalKm}-${maxTotalKm}km range`);
  }

  if (plan.routePoints.length > 0 && plan.routePoints.length < 2) {
    warnings.push('Route has too few points for map routing');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  if (warnings.length > 0) plan.validationWarnings = warnings;
  return plan;
}

aiRouter.post('/plan', async (req: Request, res: Response) => {
  const { destination, days, fitness, preferences, language, userId } = req.body;
  console.log('[AI] Planner v3 request:', destination, days, fitness);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const aiKey = process.env.AI_API_KEY;
  const aiBaseUrl = process.env.AI_BASE_URL || 'https://api.openai.com';
  const aiModel = process.env.AI_MODEL || 'gpt-4o';

  if (!aiKey) {
    res.write('data: ' + JSON.stringify({ type: 'error', message: 'AI API key not configured' }) + '\n\n');
    return res.end();
  }

  const dailyRanges: Record<string, [number, number]> = {
    beginner: [8, 12], intermediate: [12, 18], advanced: [18, 25], expert: [25, 35]
  };
  const [minDailyKm, maxDailyKm] = dailyRanges[fitness] || [12, 18];
  const minTotalKm = days * minDailyKm;
  const maxTotalKm = days * maxDailyKm;
  const maxRoutePoints = Math.max(12, Math.ceil(maxTotalKm / 2));
  const normalizedDestination = String(destination || '').toLowerCase();
  const isTigerDestination = String(destination || '').includes('\u864e\u8df3\u5ce1') ||
    normalizedDestination.includes('tiger leaping gorge') ||
    normalizedDestination.includes('hutiaoxia');
  const outputLanguage = language === 'zh' ? 'Chinese' : 'English';

  // Look up matching seed trail for real coordinates
  let seedTrailData: any = null;
  try {
    const seedTrails = await prisma.trail.findMany({
      where: {
        status: 'seed',
        OR: [
          { titleZh: { contains: destination } },
          { titleEn: { contains: destination } },
          { region: { contains: destination } },
        ],
      },
      include: { coordinates: { orderBy: { order: 'asc' } }, days: { orderBy: { dayNumber: 'asc' } } },
      take: 3,
    });

    if (seedTrails.length > 0) {
      let best = seedTrails[0];
      let bestScore = 0;
      for (const st of seedTrails) {
        let score = 0;
        if (st.titleZh.includes(destination)) score += 10;
        if (st.titleEn?.toLowerCase().includes(destination.toLowerCase())) score += 10;
        if (st.region?.includes(destination)) score += 5;
        if (score > bestScore) { bestScore = score; best = st; }
      }
      if (bestScore > 0) {
        seedTrailData = { titleZh: best.titleZh, titleEn: best.titleEn, distance: best.distance,
          elevationGain: best.elevationGain, duration: best.duration,
          coordinates: best.coordinates.map((c: any) => ({ lat: c.latitude, lng: c.longitude })) };
        console.log('[AI] Matched seed trail:', best.titleZh, '(' + best.coordinates.length + ' coords)');
      }
    }
  } catch (e: any) { console.warn('[AI] Seed lookup:', e.message); }

  if (!seedTrailData && isTigerDestination) {
    seedTrailData = {
      titleZh: '\u864e\u8df3\u5ce1\u9ad8\u8def\u5f92\u6b65',
      titleEn: 'Tiger Leaping Gorge High Trail',
      distance: 22,
      elevationGain: 1200,
      duration: 2,
      coordinates: TIGER_LEAPING_GORGE_HIGH_TRAIL.map(([lng, lat]) => ({ lat, lng })),
    };
    console.log('[AI] Using built-in Tiger Leaping Gorge high trail route (' + TIGER_LEAPING_GORGE_HIGH_TRAIL.length + ' coords)');
  }

  // Build system prompt with seed trail data if available

  // If seed trail matched, clip a segment based on user fitness & send real coords directly
  let seedRouteCoords: [number, number][] | null = null;
  let seedRouteEngine = '';
  if (seedTrailData && seedTrailData.coordinates?.length > 0) {
    if (isTigerDestination) {
      seedTrailData.titleEn = seedTrailData.titleEn || 'Tiger Leaping Gorge High Trail';
    }
    const coords: { lat: number; lng: number }[] = seedTrailData.coordinates;
    const totalTrailKm = seedTrailData.distance || 0;
    const targetKm = Math.round((minTotalKm + maxTotalKm) / 2);
    const ratio = totalTrailKm > 0 ? Math.min(1, targetKm / totalTrailKm) : 1;
    const clipCount = Math.max(4, Math.round(coords.length * ratio));
    const isTigerLeapingGorge = seedTrailData.titleZh?.includes('虎跳峡') ||
      seedTrailData.titleEn?.toLowerCase().includes('tiger leaping gorge');
    seedRouteCoords = isTigerLeapingGorge
      ? TIGER_LEAPING_GORGE_HIGH_TRAIL
      : coords.slice(0, clipCount).map(c => [c.lng, c.lat] as [number, number]);
    seedRouteEngine = 'seed_clipped';
    console.log('[AI] Seed clip: ' + totalTrailKm + 'km trail, target ' + targetKm + 'km, using ' + seedRouteCoords.length + ' coords');
  }
  let systemPrompt: string;

  if (language === 'zh') {
    let seedInfo = '';
    if (seedTrailData) {
      const samples = seedTrailData.coordinates
        .filter((_: any, i: number) => i % Math.ceil(seedTrailData.coordinates.length / 12) === 0)
        .map((c: any) => c.lat.toFixed(4) + ',' + c.lng.toFixed(4)).join(' | ');
      seedInfo = '\n\n【数据库真实路线】\n' + seedTrailData.titleZh +
        '\n全长' + seedTrailData.distance + 'km, 爬升' + seedTrailData.elevationGain + 'm, 经典' + seedTrailData.duration + '天' +
        '\n真实坐标采样: ' + samples +
        '\n请使用这些真实坐标规划路线段，根据用户天数裁切连续段。';
    }
    systemPrompt = '【第一步：确定距离！用户要' + days + '天' + fitness + '体能，总距离必须' + minTotalKm + '-' + maxTotalKm + 'km，一公里都不能多！】' + seedInfo +
      '\n\n你是专业徒步规划师。目的地：' + destination +
      '\n\n【铁律】每天' + minDailyKm + '-' + maxDailyKm + 'km，' + days + '天合计' + minTotalKm + '-' + maxTotalKm + 'km。' +
      '经典路线如果更长，你必须裁切出' + minTotalKm + '-' + maxTotalKm + 'km的连续精华段。不是整条路线！' +
      '\n\n路线要求：单向连续，无分叉折返。routePoints每1.5-3km一个点，共约' + maxRoutePoints + '个点。' +
      '\n\n返回纯JSON{"overview":"为什么选这段（必须说明总距离）","difficulty":"","totalDistance":数字（必须在' + minTotalKm + '-' + maxTotalKm + '内）","totalElevation":0,"bestSeason":"","days":[...],"gearList":[],"safetyTips":[],"routePoints":[{"name":"","lat":0,"lng":0,"type":"start/camp/end"}]}';
  } else {
    let seedInfo = '';
    if (seedTrailData) {
      const samples = seedTrailData.coordinates
        .filter((_: any, i: number) => i % Math.ceil(seedTrailData.coordinates.length / 12) === 0)
        .map((c: any) => c.lat.toFixed(4) + ',' + c.lng.toFixed(4)).join(' | ');
      seedInfo = '\n\n【REAL TRAIL IN DATABASE】\n' + seedTrailData.titleEn +
        '\nFull ' + seedTrailData.distance + 'km, +' + seedTrailData.elevationGain + 'm, classic ' + seedTrailData.duration + ' days' +
        '\nReal coordinate samples: ' + samples +
        '\nUse these real coordinates. Clip a continuous segment matching user days.';
    }
    systemPrompt = '【STEP 1: DISTANCE! User wants ' + days + ' days at ' + fitness + ' level. Total MUST be ' + minTotalKm + '-' + maxTotalKm + 'km. Not one kilometer more!】' + seedInfo +
      '\n\nYou are a professional hiking planner. Destination: ' + destination +
      '\n\n【IRON RULE】' + minDailyKm + '-' + maxDailyKm + 'km/day x ' + days + ' days = ' + minTotalKm + '-' + maxTotalKm + 'km TOTAL.' +
      ' If the classic trail is longer, you MUST clip a ' + minTotalKm + '-' + maxTotalKm + 'km continuous segment. NOT the whole trail!' +
      '\n\n?ROUTE RULES?1.No backtracking: strictly one-way, no U-turns, no loops. Every routePoint must follow forward direction. 2.Scenic priority: prefer paths with viewpoints, lakes, peaks, waterfalls, canyons, meadows. 3.routePoints every 1.5-3km, ~' + maxRoutePoints + ' points.' +
      '\n\nReturn ONLY JSON {"overview":"explain segment choice with distance","difficulty":"","totalDistance":number (MUST be ' + minTotalKm + '-' + maxTotalKm + ')","totalElevation":0,"bestSeason":"","days":[...],"gearList":[],"safetyTips":[],"routePoints":[{"name":"","lat":0,"lng":0,"type":"start/camp/end"}]}';
  }

  let structuredSeedInfo = '';
  if (seedTrailData) {
    const samples = seedTrailData.coordinates
      .filter((_: any, i: number) => i % Math.ceil(seedTrailData.coordinates.length / 12) === 0)
      .map((c: any) => c.lat.toFixed(4) + ',' + c.lng.toFixed(4)).join(' | ');
    structuredSeedInfo = '\nKnown real trail: ' + (seedTrailData.titleEn || seedTrailData.titleZh) +
      '\nFull distance: ' + seedTrailData.distance + 'km, elevation gain: ' + seedTrailData.elevationGain + 'm, classic duration: ' + seedTrailData.duration + ' days.' +
      '\nReal coordinate samples: ' + samples +
      '\nUse these real coordinates as the geographic source of truth and describe a continuous segment.';
  }

  const planSchemaExample = {
    overview: 'string',
    difficulty: 'string',
    totalDistance: 0,
    totalElevation: 0,
    bestSeason: 'string',
    days: [{
      day: 1,
      title: 'string',
      description: 'string',
      distance: 0,
      elevation: 0,
      highlights: 'string',
    }],
    gearList: ['string'],
    safetyTips: ['string'],
    routePoints: [{ name: 'string', lat: 0, lng: 0, type: 'start/camp/end/viewpoint' }],
  };

  systemPrompt =
    'You are a professional hiking trip planner. Return exactly one valid JSON object and no markdown.' +
    '\nWrite all user-facing strings in ' + outputLanguage + '.' +
    '\nDestination: ' + destination +
    '\nUser fitness: ' + fitness + '. Days: ' + days + '. Preferences: ' + (preferences || 'none') + '.' +
    '\nDaily distance target: ' + minDailyKm + '-' + maxDailyKm + 'km. Total target: ' + minTotalKm + '-' + maxTotalKm + 'km.' +
    '\nIf a classic route is longer than the target, choose a continuous highlight segment. Do not describe a loop or backtracking route unless the destination requires it.' +
    '\nRoute point rules: include 4-' + maxRoutePoints + ' forward-moving routePoints. Coordinates must be decimal degrees and plausible for the destination.' +
    structuredSeedInfo +
    '\nRequired JSON shape: ' + JSON.stringify(planSchemaExample) +
    '\nAll required keys must be present. totalDistance, totalElevation, day distance, day elevation, lat, and lng must be numbers.';

  // Send seed route coordinates immediately if available
  if (seedRouteCoords) {
    res.write('data: ' + JSON.stringify({
      type: 'seed_route',
      coordinates: seedRouteCoords,
      engine: seedRouteEngine,
    }) + '\n\n');
    res.write('data: ' + JSON.stringify({
      type: 'route_quality',
      quality: 'verified',
      label: language === 'zh' ? '真实徒步路线' : 'Verified hiking route',
      message: language === 'zh' ? '路线来自内置/数据库真实轨迹，可信度高。' : 'Route is based on known real trail geometry.',
    }) + '\n\n');
  }

  try {
    const response = await fetch(aiBaseUrl + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + aiKey },
      body: JSON.stringify({
        model: aiModel,
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: 'json_object' },
        stream: true,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      res.write('data: ' + JSON.stringify({ type: 'error', message: 'AI API error: ' + response.status }) + '\n\n');
      return res.end();
    }

    const reader = response.body?.getReader();
    if (!reader) { res.write('data: ' + JSON.stringify({ type: 'error', message: 'No response body' }) + '\n\n'); return res.end(); }

    const decoder = new TextDecoder(); let buffer = ''; let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n'); buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;
        try { const p = JSON.parse(data); const c = p.choices?.[0]?.delta?.content || ''; if (c) { fullContent += c; res.write('data: ' + JSON.stringify({ type: 'content', content: c }) + '\n\n'); } } catch {}
      }
    }

    try {
      const parsed = extractJsonObject(fullContent);
      const plan = validatePlan(parsed, minTotalKm, maxTotalKm, language);
      res.write('data: ' + JSON.stringify({ type: 'plan', plan }) + '\n\n');

      if (userId && fullContent) {
        try {
          await prisma.aIPlanSession.create({
            data: {
              userId,
              input: JSON.stringify({ destination, days, fitness, preferences }),
              output: JSON.stringify({ raw: fullContent, plan }),
            },
          });
        } catch {}
      }

      res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
      res.end();
    } catch (validationError: any) {
      console.warn('[AI] Plan validation failed:', validationError.message);
      res.write('data: ' + JSON.stringify({
        type: 'validation_error',
        message: language === 'zh'
          ? 'AI 返回的行程结构不完整，请重试，或缩小天数/目的地范围。'
          : 'The AI returned an incomplete plan. Please retry or narrow the trip scope.',
        detail: validationError.message,
      }) + '\n\n');
      res.end();
    }
  } catch (error: any) {
    res.write('data: ' + JSON.stringify({ type: 'error', message: error.message }) + '\n\n'); res.end();
  }
});

aiRouter.get('/sessions', async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const sessions = await prisma.aIPlanSession.findMany({ where: { userId: String(userId) }, orderBy: { createdAt: 'desc' }, take: 20 });
    res.json(sessions);
  } catch { res.status(500).json({ error: 'Failed to fetch sessions' }); }
});
