import { Router, Request, Response } from 'express';
import { prisma } from '../server';

export const searchRouter = Router();

// GET /api/search/geocode - proxy Nominatim
searchRouter.get('/geocode', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) return res.status(400).json({ error: 'q required' });
    const url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(q) + '&format=json&limit=1&accept-language=zh,en';
    const nr = await fetch(url, { headers: { 'User-Agent': 'HikingApp/1.0' } });
    const data: any = await nr.json();
    if (data.length > 0) {
      return res.json({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name });
    }
    res.json({});
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /api/search?q=xxx
searchRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || String(q).length < 2) return res.json({ results: [] });
    const trails = await prisma.trail.findMany({
      where: { OR: [
        { titleZh: { contains: String(q) } }, { titleEn: { contains: String(q) } },
        { descriptionZh: { contains: String(q) } }, { descriptionEn: { contains: String(q) } },
        { region: { contains: String(q) } }, { country: { contains: String(q) } },
      ] },
      include: { _count: { select: { reviews: true, favorites: true } } },
      take: 20, orderBy: { createdAt: 'desc' },
    });
    res.json({ results: trails });
  } catch { res.status(500).json({ error: 'Search failed' }); }
});
