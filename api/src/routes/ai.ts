import { Router, Request, Response } from 'express';
import { prisma } from '../server';

export const aiRouter = Router();

aiRouter.post('/plan', async (req: Request, res: Response) => {
  const { destination, days, fitness, preferences, language, userId } = req.body;

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

  // Build system prompt with seed trail data if available
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
      '\n\nRoute: single continuous one-way, no branches. routePoints every 1.5-3km, ~' + maxRoutePoints + ' points.' +
      '\n\nReturn ONLY JSON {"overview":"explain segment choice with distance","difficulty":"","totalDistance":number (MUST be ' + minTotalKm + '-' + maxTotalKm + ')","totalElevation":0,"bestSeason":"","days":[...],"gearList":[],"safetyTips":[],"routePoints":[{"name":"","lat":0,"lng":0,"type":"start/camp/end"}]}';
  }

  try {
    const response = await fetch(aiBaseUrl + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + aiKey },
      body: JSON.stringify({ model: aiModel, messages: [{ role: 'system', content: systemPrompt }], stream: true, temperature: 0.7 }),
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

    if (userId && fullContent) {
      try { await prisma.aIPlanSession.create({ data: { userId, input: JSON.stringify({ destination, days, fitness, preferences }), output: JSON.stringify({ raw: fullContent }) } }); } catch {}
    }

    res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n'); res.end();
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
