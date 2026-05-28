import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const prisma = new PrismaClient();

interface TrailSeed {
  titleZh: string;
  titleEn: string;
  difficulty: string;
  duration: number;
  distance: number;
  elevationGain: number;
  season: string;
  region: string;
  country: string;
}

async function enrichWithAI(trail: TrailSeed): Promise<any> {
  const aiKey = process.env.AI_API_KEY;
  const aiBaseUrl = process.env.AI_BASE_URL || 'https://api.openai.com';
  const aiModel = process.env.AI_MODEL || 'gpt-4o';

  if (!aiKey) {
    console.log(`  ⚠️ No AI key configured, using basic data for "${trail.titleZh}"`);
    return {
      descriptionZh: `${trail.titleZh}是一条经典徒步路线，全长约${trail.distance}公里，累计爬升${trail.elevationGain}米，通常需要${trail.duration}天完成。`,
      descriptionEn: `${trail.titleEn} is a classic hiking trail, approximately ${trail.distance}km with ${trail.elevationGain}m elevation gain, typically taking ${trail.duration} days.`,
      days: [],
      coordinates: [],
    };
  }

  const prompt = `You are a hiking guide expert. For the trail "${trail.titleZh}" (${trail.titleEn}), generate a detailed JSON response:

{
  "descriptionZh": "详细的中文路线描述，200-400字，包含风景特点、文化背景、难度说明",
  "descriptionEn": "Detailed English description, 200-400 words",
  "days": [
    { "dayNumber": 1, "titleZh": "第一天标题", "titleEn": "Day 1 Title", "description": "当日详细描述", "distance": 数字(km), "elevation": 数字(m), "highlights": "亮点" }
  ],
  "coordinates": [
    { "latitude": 纬度, "longitude": 经度, "elevation": 海拔(m), "order": 0, "name": "起点名称" },
    { "latitude": 纬度, "longitude": 经度, "elevation": 海拔(m), "order": 1, "name": "途经点" },
    ...
  ]
}

Trail info: distance=${trail.distance}km, elevation=${trail.elevationGain}m, duration=${trail.duration} days, difficulty=${trail.difficulty}, season=${trail.season}, in ${trail.region}, ${trail.country}.

Generate ${trail.duration} daily plans. Generate 5-10 coordinate points representing the actual trail path.
Return ONLY valid JSON, no markdown.`;

  try {
    const res = await fetch(`${aiBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: 'You are a hiking trail expert. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const cleaned = content.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    }
  } catch (e) {
    console.error(`  ❌ AI enrichment failed for ${trail.titleZh}:`, e);
  }

  return null;
}

async function seed() {
  console.log('🌱 Starting trail data seeding...\n');

  const trailsData: TrailSeed[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../seed-data/trails.json'), 'utf-8')
  );

  for (const trail of trailsData) {
    console.log(`📍 Processing: ${trail.titleZh} (${trail.titleEn})`);

    const existing = await prisma.trail.findFirst({
      where: { titleZh: trail.titleZh },
    });

    if (existing) {
      console.log(`  ⏭️ Already exists, skipping`);
      continue;
    }

    const enriched = await enrichWithAI(trail);
    const descZh = enriched?.descriptionZh || `${trail.titleZh}是一条经典徒步路线。`;
    const descEn = enriched?.descriptionEn || `${trail.titleEn} is a classic hiking trail.`;
    const days = enriched?.days || [];
    const coordinates = enriched?.coordinates || [];

    await prisma.trail.create({
      data: {
        titleZh: trail.titleZh,
        titleEn: trail.titleEn,
        descriptionZh: descZh,
        descriptionEn: descEn,
        difficulty: trail.difficulty,
        distance: trail.distance,
        elevationGain: trail.elevationGain,
        duration: trail.duration,
        season: trail.season,
        region: trail.region,
        country: trail.country,
        status: 'seed',
        days: {
          create: days.map((d: any) => ({
            dayNumber: d.dayNumber,
            titleZh: d.titleZh,
            titleEn: d.titleEn,
            description: d.description,
            distance: d.distance,
            elevation: d.elevation,
            highlights: d.highlights,
          })),
        },
        coordinates: {
          create: coordinates.map((c: any, i: number) => ({
            latitude: c.latitude,
            longitude: c.longitude,
            elevation: c.elevation,
            order: c.order ?? i,
          })),
        },
      },
    });

    console.log(`  ✅ Created with ${days.length} days, ${coordinates.length} coordinates`);
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✅ Seeding complete! ${trailsData.length} trails processed.`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
